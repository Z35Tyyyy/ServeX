import { Router, Request, Response } from 'express';
import { Server as SocketServer } from 'socket.io';
import { Order, Payment } from '../models/index.js';
import { paymentLimiter } from '../middleware/index.js';
import { createRazorpayOrder, verifyPaymentSignature, getRazorpayKeyId } from '../services/index.js';

const router = Router();
let io: SocketServer;

export const setPaymentsIO = (socketIO: SocketServer) => { io = socketIO; };

router.get('/key', (req: Request, res: Response) => {
    res.json({ keyId: getRazorpayKeyId() });
});

router.post('/create', paymentLimiter, async (req: Request, res: Response) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.status !== 'CREATED') return res.status(400).json({ message: 'Order already paid' });

        const razorpayOrder = await createRazorpayOrder(order.totalAmount, orderId);
        await Payment.create({ orderId, razorpayOrderId: razorpayOrder.id, amount: order.totalAmount, status: 'PENDING' });

        res.json({ razorpayOrderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency, keyId: getRazorpayKeyId() });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/verify', async (req: Request, res: Response) => {
    try {
        const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        if (!isValid) return res.status(400).json({ message: 'Invalid signature' });

        const payment = await Payment.findOneAndUpdate({ razorpayOrderId }, { razorpayPaymentId, razorpaySignature, status: 'SUCCESS' }, { new: true });
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        const order = await Order.findByIdAndUpdate(orderId, { status: 'PAID', paymentId: payment._id }, { new: true }).populate('tableId', 'tableNumber');

        if (io && order) {
            io.to('kitchen').emit('order:new', { order });
            io.to(`order:${order._id}`).emit('order:statusUpdate', { orderId: order._id, status: 'PAID' });
        }

        res.json({ message: 'Payment verified', order });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
