import mongoose, { Document, Schema } from 'mongoose';

export interface ITable extends Document {
    tableNumber: number;
    qrCodeUrl: string;
    qrCodeData: string;
    isActive: boolean;
    capacity: number;
    createdAt: Date;
    updatedAt: Date;
}

const tableSchema = new Schema<ITable>({
    tableNumber: { type: Number, required: true, unique: true },
    qrCodeUrl: { type: String, required: true },
    qrCodeData: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    capacity: { type: Number, default: 4 },
}, { timestamps: true });

export const Table = mongoose.model<ITable>('Table', tableSchema);
