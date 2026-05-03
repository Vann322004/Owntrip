import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();


router.post('/check-availability', BookingController.checkAvailability);


router.post('/create', verifyToken, BookingController.createBooking);

// Route xem lịch sử đặt phòng 
router.get('/my-bookings', verifyToken, BookingController.getMyBookings);

// Route xem booking của khách sạn (Dành cho Hotel Owner - Bắt buộc đăng nhập)
// PHẢI đặt TRƯỚC /:id để tránh bị Express bắt nhầm "hotel" thành id
router.get('/hotel/:hotelId', verifyToken, BookingController.getHotelBookings);


router.get('/hotel/:hotelId/transactions', verifyToken, BookingController.getHotelTransactions);


router.get('/:id', verifyToken, BookingController.getBookingDetail);


router.post('/:id/cancel', verifyToken, BookingController.cancelBooking);

module.exports = router;
