import { Schema, model } from 'mongoose';
import { IHotelRequest } from '../interfaces/hotelRequest.interface';
import { generateCustomId } from '../utils/idGenerator';

const hotelRequestSchema = new Schema<IHotelRequest>({
  requestId: { type: String, unique: true },
  userId: { type: String, ref: 'User', required: true },
  hotelName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: String, required: true },
  description: { type: String },
  images: [String],
  legalDocuments: {
    businessLicense: { type: String },
    securityCertificate: { type: String },
    pcccCertificate: { type: String },
    identityCard: { type: String },
    leaseContract: { type: String }
  },
  amenities: [String],
  businessPolicies: {
    cancellationPolicy: { type: String },
    childPolicy: { type: String },
    checkInTime: { type: String },
    checkOutTime: { type: String },
    extraCosts: { type: String }
  },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminComment: { type: String }
}, { timestamps: true, versionKey: false });

hotelRequestSchema.pre<IHotelRequest>('save', async function() {
  if (this.isNew) {
    this.requestId = await generateCustomId(model('HotelRequest'), 'ReqId', 'requestId');
  }
});

export default model<IHotelRequest>('HotelRequest', hotelRequestSchema);
