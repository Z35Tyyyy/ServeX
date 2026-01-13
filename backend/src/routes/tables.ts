import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Table } from '../models/index.js';
import { protect, authorize, validate } from '../middleware/index.js';
import { generateTableQRCode } from '../services/index.js';

const router = Router();

const createTableSchema = z.object({ body: z.object({ tableNumber: z.number().int().positive(), capacity: z.number().int().positive().optional() }) });

router.get('/', async (req: Request, res: Response) => {
    try {
        const tables = await Table.find().sort({ tableNumber: 1 });
        res.json(tables);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const table = await Table.findById(req.params.id);
        if (!table) return res.status(404).json({ message: 'Table not found' });
        if (!table.isActive) return res.status(400).json({ message: 'Table is inactive' });
        res.json({ id: table._id, tableNumber: table.tableNumber, isActive: table.isActive, capacity: table.capacity });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', protect, authorize('admin'), validate(createTableSchema), async (req: Request, res: Response) => {
    try {
        const { tableNumber, capacity } = req.body;
        const exists = await Table.findOne({ tableNumber });
        if (exists) return res.status(400).json({ message: 'Table number already exists' });
        const tempTable = await Table.create({ tableNumber, capacity, qrCodeUrl: '', qrCodeData: '' });
        const { url, data } = await generateTableQRCode(tempTable._id.toString());
        tempTable.qrCodeUrl = url;
        tempTable.qrCodeData = data;
        await tempTable.save();
        res.status(201).json(tempTable);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.patch('/:id', protect, authorize('admin'), async (req: Request, res: Response) => {
    try {
        const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!table) return res.status(404).json({ message: 'Table not found' });
        res.json(table);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id', protect, authorize('admin'), async (req: Request, res: Response) => {
    try {
        const table = await Table.findByIdAndDelete(req.params.id);
        if (!table) return res.status(404).json({ message: 'Table not found' });
        res.json({ message: 'Table deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:id/regenerate-qr', protect, authorize('admin'), async (req: Request, res: Response) => {
    try {
        const table = await Table.findById(req.params.id);
        if (!table) return res.status(404).json({ message: 'Table not found' });
        const { url, data } = await generateTableQRCode(table._id.toString());
        table.qrCodeUrl = url;
        table.qrCodeData = data;
        await table.save();
        res.json({ qrCodeUrl: table.qrCodeUrl, qrCodeData: table.qrCodeData });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
