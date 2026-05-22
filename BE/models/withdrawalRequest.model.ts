import { Schema, model, Document } from "mongoose";

export type WithdrawalStatus = "pending" | "approved" | "rejected";

export interface IWithdrawalRequest extends Document {
  userId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: WithdrawalStatus;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalRequestSchema = new Schema<IWithdrawalRequest>(
  {
    userId: { type: String, ref: "User", required: true },
    amount: { type: Number, required: true, min: 1000 },
    bankName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    accountName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    adminNote: { type: String, trim: true }
  },
  { timestamps: true, versionKey: false }
);

export default model<IWithdrawalRequest>("WithdrawalRequest", withdrawalRequestSchema);
