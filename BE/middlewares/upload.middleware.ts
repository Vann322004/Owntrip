import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';
import { Request } from 'express';

// ─── Cloudinary Storage cho Frame ────────────────────────────────────────────
const frameStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'frames',
    format: async () => 'png',
    use_filename: true,
    unique_filename: true,
  } as any,
});

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

export const uploadFrame = multer({
  storage: frameStorage,
  fileFilter: pngFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// ─── Cloudinary Storage cho Hotel Images ─────────────────────────────────────
const hotelImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'hotel-images',
    format: async () => 'jpg',
    use_filename: true,
    unique_filename: true,
  } as any,
});

const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file JPG, PNG hoặc WEBP'));
  }
};

export const uploadHotelImage = multer({
  storage: hotelImageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
