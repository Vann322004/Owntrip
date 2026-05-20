import { Document } from 'mongoose';

export interface ICreatorPackage extends Document {
  name: string;
  durationInMonths: number;
  price: number;
  description?: string;
  isActive: boolean;
}
