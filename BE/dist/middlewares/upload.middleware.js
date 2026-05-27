"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFrame = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
// ─── Cloudinary Storage cho Frame ────────────────────────────────────────────
// File sẽ được upload thẳng lên Cloudinary, không lưu disk
const frameStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: {
        folder: 'frames', // Lưu vào folder "frames" trên Cloudinary
        format: async () => 'png', // Luôn convert sang PNG
        use_filename: true, // Giữ tên file gốc
        unique_filename: true, // Thêm suffix ngẫu nhiên tránh trùng tên
    }, // as any vì multer-storage-cloudinary v4 chưa có full TS types
});
// ─── Filter: chỉ chấp nhận file PNG ─────────────────────────────────────────
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
// ─── Upload middleware cho frame ─────────────────────────────────────────────
// Dùng: router.post('/', uploadFrame.single('image'), createFrame)
exports.uploadFrame = (0, multer_1.default)({
    storage: frameStorage,
    fileFilter: pngFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // Giới hạn 10MB
    },
});
