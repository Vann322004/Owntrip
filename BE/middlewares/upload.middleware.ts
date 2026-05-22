import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';
import { Request } from 'express';

// ─── Cloudinary Storage cho Frame ────────────────────────────────────────────
// File sẽ được upload thẳng lên Cloudinary, không lưu disk
const frameStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'frames',              // Lưu vào folder "frames" trên Cloudinary
    format: async () => 'png',     // Luôn convert sang PNG
    use_filename: true,            // Giữ tên file gốc
    unique_filename: true,         // Thêm suffix ngẫu nhiên tránh trùng tên
  } as any,                        // as any vì multer-storage-cloudinary v4 chưa có full TS types
});

// ─── Filter: chỉ chấp nhận file PNG ─────────────────────────────────────────
const pngFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const isPng =
    file.mimetype === 'image/png' ||
    file.originalname.toLowerCase().endsWith('.png');

  if (isPng) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file PNG cho frame ảnh'));
  }
};

// ─── Upload middleware cho frame ─────────────────────────────────────────────
// Dùng: router.post('/', uploadFrame.single('image'), createFrame)
export const uploadFrame = multer({
  storage: frameStorage,
  fileFilter: pngFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Giới hạn 10MB
  },
});
