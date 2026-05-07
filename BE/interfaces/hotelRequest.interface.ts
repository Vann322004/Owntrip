import { Document } from 'mongoose';

export interface IHotelRequest extends Document {
  requestId: string;
  userId: string;
  hotelName: string;
  address: string;
  city: string;
  phone: string;
  description: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
  createdAt: Date;
  updatedAt: Date;
}
