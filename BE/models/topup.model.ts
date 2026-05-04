import { Schema, model } from 'mongoose';

export interface ITopup {
  bookingId: string;
  orderCode: number;
  userId: string;
  hotelId?: string; 
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
}

const topupSchema = new Schema<ITopup>({
  bookingId: { type: String, required: true, unique: true },
  orderCode: { type: Number, required: true, unique: true },
  userId: { type: String, required: true },
  hotelId: { type: String }, 
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
}, { timestamps: true });

export default model<ITopup>('Topup', topupSchema);
