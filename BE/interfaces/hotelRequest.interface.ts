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
  legalDocuments: {
    businessLicense: string;
    securityCertificate: string;
    pcccCertificate: string;
    identityCardFront: string;
    identityCardBack: string;
    leaseContract?: string;
  };
  amenities: string[];
  businessPolicies: {
    cancellationPolicy: string;
    childPolicy: string;
    checkInTime: string;
    checkOutTime: string;
    extraCosts?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
  createdAt: Date;
  updatedAt: Date;
}
