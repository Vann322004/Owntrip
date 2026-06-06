"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadHotelImage = exports.uploadFrame = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
// ─── Cloudinary Storage cho Frame ────────────────────────────────────────────
const frameStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: {
        folder: 'frames',
        format: async () => 'png',
        use_filename: true,
        unique_filename: true,
    },
});
const pngFileFilter = (req, file, cb) => {
    const isPng = file.mimetype === 'image/png' ||
        file.originalname.toLowerCase().endsWith('.png');
    if (isPng) {
        cb(null, true);
    }
    else {
        cb(new Error('Chỉ chấp nhận file PNG cho frame ảnh'));
    }
};
exports.uploadFrame = (0, multer_1.default)({
    storage: frameStorage,
    fileFilter: pngFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});
// ─── Cloudinary Storage cho Hotel Images ─────────────────────────────────────
const hotelImageStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: {
        folder: 'hotel-images',
        format: async () => 'jpg',
        use_filename: true,
        unique_filename: true,
    },
});
const imageFileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Chỉ chấp nhận file JPG, PNG hoặc WEBP'));
    }
};
exports.uploadHotelImage = (0, multer_1.default)({
    storage: hotelImageStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
