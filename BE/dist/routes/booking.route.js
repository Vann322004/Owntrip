"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("../controllers/booking.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/check-availability', booking_controller_1.BookingController.checkAvailability);
router.post('/create', auth_middleware_1.verifyToken, booking_controller_1.BookingController.createBooking);
// Route xem lịch sử đặt phòng 
router.get('/my-bookings', auth_middleware_1.verifyToken, booking_controller_1.BookingController.getMyBookings);
// Route xem booking của khách sạn (Dành cho Hotel Owner - Bắt buộc đăng nhập)
// PHẢI đặt TRƯỚC /:id để tránh bị Express bắt nhầm "hotel" thành id
router.get('/hotel/:hotelId', auth_middleware_1.verifyToken, booking_controller_1.BookingController.getHotelBookings);
router.get('/hotel/:hotelId/transactions', auth_middleware_1.verifyToken, booking_controller_1.BookingController.getHotelTransactions);
router.get('/:id', auth_middleware_1.verifyToken, booking_controller_1.BookingController.getBookingDetail);
router.post('/:id/cancel', auth_middleware_1.verifyToken, booking_controller_1.BookingController.cancelBooking);
router.patch('/:id/status', auth_middleware_1.verifyToken, booking_controller_1.BookingController.updateBookingStatus);
module.exports = router;
