"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const creatorPackageSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    durationInMonths: { type: Number, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false });
exports.default = (0, mongoose_1.model)('CreatorPackage', creatorPackageSchema);
