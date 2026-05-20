import { Document } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  email: string;
  password?: string;
  displayName: string;
  image?: string;
  phone?: string;
  balance: number;
  points: number;
  role: 'user' | 'admin' | 'hotel_owner' | 'creator';
  creatorSubscriptionEndsAt?: Date;
  otp?: string;
  otpExpires?: Date;
  isVerified: boolean;
}