import { Schema, model } from 'mongoose';
import { ICreatorSubscriptionTransaction } from '../interfaces/creatorSubscriptionTransaction.interface';

const creatorSubscriptionTransactionSchema = new Schema<ICreatorSubscriptionTransaction>({
  userId: { type: String, ref: 'User', required: true },
  packageId: { type: Schema.Types.ObjectId, ref: 'CreatorPackage', required: true },
  amount: { type: Number, required: true },
  orderCode: { type: Number, required: true, unique: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' }
}, { timestamps: true, versionKey: false });

export default model<ICreatorSubscriptionTransaction>('CreatorSubscriptionTransaction', creatorSubscriptionTransactionSchema);
