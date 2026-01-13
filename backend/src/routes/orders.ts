import { Router, Request, Response } from 'express';
import { Server as SocketServer } from 'socket.io';
import { Order, MenuItem, Table } from '../models/index.js';
import { protect, authorize, orderLimiter } from '../middleware/index.js';

const router = Router();
let io: SocketServer;

export const setOrdersIO = (socketIO: SocketServer) => { io = socketIO; };

const TAX_RATE = 0.05;
const SERVICE_CHARGE_RATE = 0.05;

router.post('/', orderLimiter, async (req: Request, res: Response) => {
    try {
        const { tableId, items, sessionId, customerName, customerPhone } = req.body;
        const table = await Table.findById(tableId);
        if (!table || !table.isActive) return res.status(400).json({ message: 'Invalid table' });

        const menuItemIds = items.map((i: any) => i.menuItemId);
        const menuItems = await MenuItem.find({ _id: { $in: menuItemIds }, isAvailable: true });
        if (menuItems.length !== items.length) return res.status(400).json({ message: 'Some items unavailable' });

        const orderItems = items.map((item: any) => {
            const menuItem = menuItems.find((m) => m._id.toString() === item.menuItemId);
            return { menuItemId: item.menuItemId, name: menuItem!.name, quantity: item.quantity, price: menuItem!.price, specialInstructions: item.specialInstructions };
        });

        const subtotal = orderItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
        const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
        const serviceCharge = Math.round(subtotal * SERVICE_CHARGE_RATE * 100) / 100;
        const totalAmount = Math.round((subtotal + tax + serviceCharge) * 100) / 100;

        const order = await Order.create({ tableId, items: orderItems, subtotal, tax, serviceCharge, totalAmount, sessionId, customerName, customerPhone });
        res.status(201).json({ order, message: 'Order created' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/kitchen/active', protect, authorize('admin', 'kitchen'), async (req: Request, res: Response) => {
    try {
        const orders = await Order.find({ status: { $in: ['PAID', 'PREPARING', 'READY'] } }).populate('tableId', 'tableNumber').sort({ createdAt: 1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id).populate('tableId', 'tableNumber');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.patch('/:id/status', protect, authorize('admin', 'kitchen'), async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('tableId', 'tableNumber');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (io) {
            io.to('kitchen').emit('order:statusUpdate', { orderId: order._id, status });
            io.to(`order:${order._id}`).emit('order:statusUpdate', { orderId: order._id, status });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/', protect, authorize('admin'), async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const query: any = {};
        if (status) query.status = status;
        const orders = await Order.find(query).populate('tableId', 'tableNumber').sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit));
        const total = await Order.countDocuments(query);
        res.json({ orders, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/analytics/summary', protect, authorize('admin'), async (req: Request, res: Response) => {
    try {
        const result = await Order.aggregate([
            { $match: { status: { $in: ['PAID', 'PREPARING', 'READY', 'SERVED'] } } },
            { $group: { _id: null, totalOrders: { $sum: 1 }, totalRevenue: { $sum: '$totalAmount' } } }
        ]);
        const summary = result[0] || { totalOrders: 0, totalRevenue: 0 };
        summary.avgOrderValue = summary.totalOrders > 0 ? summary.totalRevenue / summary.totalOrders : 0;
        const topItems = await Order.aggregate([
            { $match: { status: { $in: ['PAID', 'PREPARING', 'READY', 'SERVED'] } } },
            { $unwind: '$items' },
            { $group: { _id: '$items.menuItemId', name: { $first: '$items.name' }, totalQuantity: { $sum: '$items.quantity' }, totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 }
        ]);
        res.json({ summary, topItems });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
