"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const idGenerator_1 = require("../utils/idGenerator");
const hotelRequestSchema = new mongoose_1.Schema({
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
        identityCardFront: { type: String },
        identityCardBack: { type: String },
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
hotelRequestSchema.pre('save', async function () {
    if (this.isNew) {
        this.requestId = await (0, idGenerator_1.generateCustomId)((0, mongoose_1.model)('HotelRequest'), 'ReqId', 'requestId');
    }
});
exports.default = (0, mongoose_1.model)('HotelRequest', hotelRequestSchema);
