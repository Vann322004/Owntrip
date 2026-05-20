import { Document } from 'mongoose';

export interface ICheckin extends Document {
  userId: string;
  imageUri: string;
  title: string;
  date: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}
