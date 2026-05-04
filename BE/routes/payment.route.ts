import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * POST /api/payment/create-payment-link
 * Tạo link thanh toán PayOS cho một booking đã tồn tại
 * Body: { bookingId, amount, description, returnUrl?, cancelUrl? }
 */
router.post('/create-payment-link', verifyToken, PaymentController.createPaymentLink);

/**
 * POST /api/payment/create-booking-payment
 * Tạo booking MỚI + link thanh toán PayOS trong 1 request
 * Body: { hotelId, roomTypeId, checkIn, checkOut, roomCount, guestInfo }
 */
router.post('/create-booking-payment', verifyToken, PaymentController.createBookingWithPayment);

/**
 * GET /api/payment/status/:bookingId
 * Kiểm tra trạng thái thanh toán của booking (cho FE polling)
 */
router.get('/status/:bookingId', verifyToken, PaymentController.checkPaymentStatus);

/**
 * GET /api/payment/:orderCode
 * Lấy thông tin chi tiết một payment link từ PayOS
 */
router.get('/:orderCode', verifyToken, PaymentController.getPaymentInfo);

/**
 * PUT /api/payment/:orderCode/cancel
 * Hủy payment link
 * Body: { cancellationReason? }
 */
router.put('/:orderCode/cancel', verifyToken, PaymentController.cancelPaymentLink);

/**
 * POST /api/payment/confirm-webhook
 * Đăng ký / xác nhận webhook URL với PayOS (chỉ dùng 1 lần khi setup)
 * Body: { webhookUrl }
 */
router.post('/confirm-webhook', PaymentController.confirmWebhook);

/**
 * POST /api/payment/webhook/payos
 * Endpoint nhận callback từ PayOS khi thanh toán hoàn tất
 * KHÔNG cần auth - PayOS server gọi trực tiếp
 */
router.post('/webhook/payos', PaymentController.handleWebhook);

module.exports = router;
