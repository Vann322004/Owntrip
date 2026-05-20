import mongoose, { Schema, Document } from "mongoose";

export interface IWallet extends Document {
  userId: string;
  balance: number;
  currency: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: String,
      ref: 'User',
      sparse: true
    },
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'VND'
    },
    isSystem: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model<IWallet>("Wallet", walletSchema);

