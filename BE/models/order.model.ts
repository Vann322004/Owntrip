import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  orderCode: number;
  buyerId: string;
  sellerId: string;
  tripTemplateId: mongoose.Types.ObjectId;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  providerTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderCode: {
      type: Number,
      required: true,
      unique: true
    },
    buyerId: {
      type: String,
      ref: 'User',
      required: true
    },
    sellerId: {
      type: String,
      ref: 'User',
      required: true
    },
    tripTemplateId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'],
      default: 'PENDING'
    },
    providerTransactionId: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", orderSchema);
