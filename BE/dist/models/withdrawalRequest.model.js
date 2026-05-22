"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const withdrawalRequestSchema = new mongoose_1.Schema({
    userId: { type: String, ref: "User", required: true },
    amount: { type: Number, required: true, min: 1000 },
    bankName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    accountName: { type: String, required: true, trim: true },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    adminNote: { type: String, trim: true }
}, { timestamps: true, versionKey: false });
exports.default = (0, mongoose_1.model)("WithdrawalRequest", withdrawalRequestSchema);
