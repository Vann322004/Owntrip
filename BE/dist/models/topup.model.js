"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const topupSchema = new mongoose_1.Schema({
    bookingId: { type: String, required: true, unique: true },
    orderCode: { type: Number, required: true, unique: true },
    userId: { type: String, required: true },
    hotelId: { type: String },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Topup', topupSchema);
