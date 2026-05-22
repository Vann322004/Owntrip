import { Document } from 'mongoose';

// Interface định nghĩa cấu trúc dữ liệu của Frame ảnh check-in
export interface IFrame extends Document {
  name: string;           // Tên frame
  imageUrl: string;       // URL ảnh frame đầy đủ (từ Cloudinary)
  thumbnailUrl?: string;  // URL ảnh thumbnail (tùy chọn)
  category: string;       // Danh mục (vd: general, travel, holiday...)
  layoutType: 'single' | 'filmstrip-4'; // Kiểu bố cục
  slotsCount: number;     // Số ô ảnh trong frame
  isActive: boolean;      // Trạng thái hiển thị
  order: number;          // Thứ tự hiển thị
  createdAt: Date;
  updatedAt: Date;
}
