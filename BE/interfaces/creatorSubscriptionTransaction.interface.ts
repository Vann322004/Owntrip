import { Document, Types } from 'mongoose';

export interface ICreatorSubscriptionTransaction extends Document {
  userId: string;
  packageId: Types.ObjectId;
  amount: number;
  orderCode: number;
  status: 'pending' | 'success' | 'failed';
}
