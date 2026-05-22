"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const creatorSubscriptionTransactionSchema = new mongoose_1.Schema({
    userId: { type: String, ref: 'User', required: true },
    packageId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'CreatorPackage', required: true },
    amount: { type: Number, required: true },
    orderCode: { type: Number, required: true, unique: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' }
}, { timestamps: true, versionKey: false });
exports.default = (0, mongoose_1.model)('CreatorSubscriptionTransaction', creatorSubscriptionTransactionSchema);
