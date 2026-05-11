"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
/**
 * POST /api/payment/create-payment-link
 * Tạo link thanh toán PayOS cho một booking đã tồn tại
 * Body: { bookingId, amount, description, returnUrl?, cancelUrl? }
 */
router.post('/create-payment-link', auth_middleware_1.verifyToken, payment_controller_1.PaymentController.createPaymentLink);
/**
 * POST /api/payment/create-booking-payment
 * Tạo booking MỚI + link thanh toán PayOS trong 1 request
 * Body: { hotelId, roomTypeId, checkIn, checkOut, roomCount, guestInfo }
 */
router.post('/create-booking-payment', auth_middleware_1.verifyToken, payment_controller_1.PaymentController.createBookingWithPayment);
/**
 * GET /api/payment/status/:bookingId
 * Kiểm tra trạng thái thanh toán của booking (cho FE polling)
 */
router.get('/status/:bookingId', auth_middleware_1.verifyToken, payment_controller_1.PaymentController.checkPaymentStatus);
/**
 * GET /api/payment/:orderCode
 * Lấy thông tin chi tiết một payment link từ PayOS
 */
router.get('/:orderCode', auth_middleware_1.verifyToken, payment_controller_1.PaymentController.getPaymentInfo);
/**
 * PUT /api/payment/:orderCode/cancel
 * Hủy payment link
 * Body: { cancellationReason? }
 */
router.put('/:orderCode/cancel', auth_middleware_1.verifyToken, payment_controller_1.PaymentController.cancelPaymentLink);
/**
 * POST /api/payment/confirm-webhook
 * Đăng ký / xác nhận webhook URL với PayOS (chỉ dùng 1 lần khi setup)
 * Body: { webhookUrl }
 */
router.post('/confirm-webhook', payment_controller_1.PaymentController.confirmWebhook);
/**
 * POST /api/payment/webhook/payos
 * Endpoint nhận callback từ PayOS khi thanh toán hoàn tất
 * KHÔNG cần auth - PayOS server gọi trực tiếp
 */
router.post('/webhook/payos', payment_controller_1.PaymentController.handleWebhook);
module.exports = router;
