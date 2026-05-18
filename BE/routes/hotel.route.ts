import { Router } from 'express';
import { HotelController } from '../controllers/hotel.controller';
import { verifyToken, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

// Route lấy danh sách khách sạn (lọc theo city nếu có)
router.get('/', HotelController.getAllHotels);

// Route lấy danh sách khách sạn của chính chủ 
router.get('/my-hotels', verifyToken, HotelController.getMyHotels);

// Route lấy dữ liệu tổng hợp cho UI (Không cần đăng nhập)
router.get('/:id/page', HotelController.getHotelFullPage);

// Route đăng đánh giá (Bắt buộc đăng nhập) (Thêm mới/Cập nhật)
router.post('/review', verifyToken, HotelController.postReview);

// Route lấy đánh giá của tôi cho một khách sạn cụ thể
router.get('/:id/my-review', verifyToken, HotelController.getMyReview);

// Route xóa đánh giá của tôi cho khách sạn
router.delete('/:id/review', verifyToken, HotelController.deleteReview);

// Route gán chủ sở hữu cho khách sạn (Chỉ Admin)
router.post('/assign-owner', verifyToken, authorizeRole(['admin']), HotelController.assignOwner);

// Route tạo khách sạn 
router.post('/create', verifyToken, HotelController.createHotel);

// Route cập nhật khách sạn 
router.patch('/:id', verifyToken, HotelController.updateHotel);

// Route xóa khách sạn (Admin)
router.delete('/:id', verifyToken, authorizeRole(['admin']), HotelController.deleteHotel);

module.exports = router;