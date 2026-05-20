import { Schema, model } from 'mongoose';
import { ICreatorPackage } from '../interfaces/creatorPackage.interface';

const creatorPackageSchema = new Schema<ICreatorPackage>({
  name: { type: String, required: true },
  durationInMonths: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false });

export default model<ICreatorPackage>('CreatorPackage', creatorPackageSchema);
