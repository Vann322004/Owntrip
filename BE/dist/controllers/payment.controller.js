"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payos_1 = __importDefault(require("../utils/payos"));
const booking_model_1 = __importDefault(require("../models/booking.model"));
const hotel_model_1 = __importDefault(require("../models/hotel.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const roomInventory_model_1 = __importDefault(require("../models/roomInventory.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const emailService_1 = require("../utils/emailService");
const YOUR_DOMAIN = process.env.FRONTEND_URL || 'http://192.168.1.3:8081';
exports.PaymentController = {
    /**
     * API 1: Tạo link thanh toán PayOS
     * POST /api/payment/create-payment-link
     * Body: { bookingId, amount, description, returnUrl?, cancelUrl? }
     */
    createPaymentLink: async (req, res) => {
        try {
            const { bookingId, amount, description, returnUrl, cancelUrl, hotelId } = req.body;
            if (!bookingId || !amount || !description) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin bắt buộc: bookingId, amount, description',
                });
            }
            const body = {
                orderCode: Number(String(Date.now()).slice(-6)),
                amount: Number(amount),
                description: String(description).slice(0, 25),
                returnUrl: returnUrl || `${YOUR_DOMAIN}/payment/success?bookingId=${bookingId}`,
                cancelUrl: cancelUrl || `${YOUR_DOMAIN}/payment/cancel?bookingId=${bookingId}`,
                items: [
                    {
                        name: String(description).slice(0, 50),
                        quantity: 1,
                        price: Number(amount),
                    },
                ],
            };
            // v2 SDK: payOS.paymentRequests.create(...)
            const paymentLinkRes = await payos_1.default.paymentRequests.create(body);
            if (String(bookingId).startsWith('topup_') || String(bookingId).startsWith('temp_')) {
                const Topup = require('../models/topup.model').default;
                await Topup.create({
                    bookingId,
                    orderCode: paymentLinkRes.orderCode,
                    userId: req.user?.userId || 'unknown',
                    hotelId,
                    amount: Number(amount),
                    status: 'pending'
                });
            }
            else {
                await booking_model_1.default.findOneAndUpdate({ bookingId }, {
                    payosOrderCode: paymentLinkRes.orderCode,
                    payosCheckoutUrl: paymentLinkRes.checkoutUrl,
                    paymentStatus: 'unpaid',
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Tạo link thanh toán thành công',
                data: {
                    bin: paymentLinkRes.bin,
                    checkoutUrl: paymentLinkRes.checkoutUrl,
                    accountNumber: paymentLinkRes.accountNumber,
                    accountName: paymentLinkRes.accountName,
                    amount: paymentLinkRes.amount,
                    description: paymentLinkRes.description,
                    orderCode: paymentLinkRes.orderCode,
                    qrCode: paymentLinkRes.qrCode,
                },
            });
        }
        catch (error) {
            console.error('[PayOS] createPaymentLink error:', error);
            return res.status(500).json({
                success: false,
                message: 'Không thể tạo link thanh toán',
                error: error.message,
            });
        }
    },
    /**
     * API 2: Lấy thông tin một payment link
     * GET /api/payment/:orderCode
     */
    getPaymentInfo: async (req, res) => {
        try {
            const orderCode = Number(req.params.orderCode);
            // v2 SDK: payOS.paymentRequests.get({ orderCode })
            const order = await payos_1.default.paymentRequests.get(orderCode);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy đơn thanh toán' });
            }
            return res.status(200).json({ success: true, data: order });
        }
        catch (error) {
            console.error('[PayOS] getPaymentInfo error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },
    /**
     * API 3: Hủy payment link
     * PUT /api/payment/:orderCode/cancel
     * Body: { cancellationReason? }
     */
    cancelPaymentLink: async (req, res) => {
        try {
            const orderCode = Number(req.params.orderCode);
            const { cancellationReason } = req.body;
            // v2 SDK: payOS.paymentRequests.cancel(orderCode, reason)
            const order = await payos_1.default.paymentRequests.cancel(orderCode, cancellationReason || 'Người dùng hủy thanh toán');
            if (!order) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy đơn thanh toán' });
            }
            await booking_model_1.default.findOneAndUpdate({ payosOrderCode: orderCode }, {
                paymentStatus: 'unpaid',
                status: 'cancelled',
                cancellationReason: cancellationReason || 'Người dùng hủy thanh toán',
            });
            return res.status(200).json({ success: true, message: 'Hủy thanh toán thành công', data: order });
        }
        catch (error) {
            console.error('[PayOS] cancelPaymentLink error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },
    /**
     * API 4: Xác nhận Webhook URL với PayOS
     * POST /api/payment/confirm-webhook
     * Body: { webhookUrl }
     */
    confirmWebhook: async (req, res) => {
        try {
            const { webhookUrl } = req.body;
            if (!webhookUrl) {
                return res.status(400).json({ success: false, message: 'Thiếu webhookUrl' });
            }
            // v2 SDK: payOS.webhooks.confirm(webhookUrl)
            await payos_1.default.webhooks.confirm(webhookUrl);
            return res.status(200).json({ success: true, message: 'Xác nhận webhook thành công' });
        }
        catch (error) {
            console.error('[PayOS] confirmWebhook error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },
    /**
     * API 5: Nhận webhook từ PayOS (callback khi thanh toán thành công)
     * POST /api/payment/webhook/payos
     */
    handleWebhook: async (req, res) => {
        try {
            // v2 SDK: payOS.webhooks.verify(body)
            const webhookData = await payos_1.default.webhooks.verify(req.body);
            console.log('[PayOS Webhook] Received:', webhookData);
            // Bỏ qua giao dịch thử nghiệm
            if (['Ma giao dich thu nghiem', 'VQRIO123'].includes(webhookData.description)) {
                return res.status(200).json({ success: true, message: 'Test webhook OK', data: webhookData });
            }
            // Xử lý thanh toán thành công (code === '00')
            if (webhookData.code === '00') {
                const Topup = require('../models/topup.model').default;
                const topup = await Topup.findOne({ orderCode: webhookData.orderCode });
                if (topup) {
                    await exports.PaymentController._handleSuccessfulTopup(webhookData);
                }
                else {
                    await exports.PaymentController._handleSuccessfulPayment(webhookData);
                }
            }
            return res.status(200).json({ success: true, message: 'Webhook processed', data: webhookData });
        }
        catch (error) {
            console.error('[PayOS Webhook] Error:', error);
            // Vẫn trả 200 để PayOS không retry
            return res.status(200).json({ success: false, message: 'Webhook error', error: error.message });
        }
    },
    /**
     * API 6: Kiểm tra trạng thái thanh toán theo bookingId (polling từ FE)
     * GET /api/payment/status/:bookingId
     */
    checkPaymentStatus: async (req, res) => {
        try {
            const { bookingId } = req.params;
            if (String(bookingId).startsWith('topup_') || String(bookingId).startsWith('temp_')) {
                const Topup = require('../models/topup.model').default;
                const topup = await Topup.findOne({ bookingId });
                if (!topup) {
                    return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch nạp tiền' });
                }
                let payosStatus = null;
                try {
                    payosStatus = await payos_1.default.paymentRequests.get(topup.orderCode);
                    if (payosStatus.status === 'PAID' && topup.status !== 'paid') {
                        await exports.PaymentController._handleSuccessfulTopup({ orderCode: topup.orderCode });
                        topup.status = 'paid';
                    }
                }
                catch (e) { }
                return res.status(200).json({
                    success: true,
                    data: {
                        bookingId: topup.bookingId,
                        paymentStatus: topup.status === 'paid' ? 'paid' : 'unpaid',
                        bookingStatus: topup.status,
                        totalPrice: topup.amount,
                        payosStatus: payosStatus?.status || null,
                        checkoutUrl: null,
                    },
                });
            }
            const booking = await booking_model_1.default.findOne({ bookingId });
            if (!booking) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy booking' });
            }
            // Nếu có orderCode, truy vấn PayOS để lấy trạng thái mới nhất
            let payosStatus = null;
            if (booking.payosOrderCode) {
                try {
                    // v2 SDK: payOS.paymentRequests.get({ orderCode })
                    payosStatus = await payos_1.default.paymentRequests.get(booking.payosOrderCode);
                    // NẾU POLLING THẤY ĐÃ THANH TOÁN MÀ DATABASE CHƯA CẬP NHẬT
                    if (payosStatus.status === 'PAID' && booking.paymentStatus !== 'paid') {
                        await exports.PaymentController._handleSuccessfulPayment({ orderCode: booking.payosOrderCode });
                        // Cập nhật lại để trả về đúng kết quả cho FE
                        booking.paymentStatus = 'paid';
                        booking.status = 'confirmed';
                    }
                }
                catch (e) {
                    // Không ảnh hưởng nếu lấy thất bại
                }
            }
            return res.status(200).json({
                success: true,
                data: {
                    bookingId: booking.bookingId,
                    paymentStatus: booking.paymentStatus,
                    bookingStatus: booking.status,
                    totalPrice: booking.totalPrice,
                    payosStatus: payosStatus?.status || null,
                    checkoutUrl: booking.payosCheckoutUrl || null,
                },
            });
        }
        catch (error) {
            console.error('[PayOS] checkPaymentStatus error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },
    /**
     * API 7: Tạo booking + payment link trong 1 request (integrated flow)
     * POST /api/payment/create-booking-payment
     */
    createBookingWithPayment: async (req, res) => {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const { hotelId, roomTypeId, checkIn, checkOut, roomCount, guestInfo } = req.body;
            const userId = req.user.userId;
            if (!hotelId || !roomTypeId || !checkIn || !checkOut || !roomCount || !guestInfo) {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
            }
            const phoneRegex = /^0\d{9}$/;
            if (!phoneRegex.test(guestInfo.phone)) {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ' });
            }
            const startDate = new Date(checkIn);
            const endDate = new Date(checkOut);
            const dateRange = [];
            let currentDate = new Date(startDate);
            while (currentDate < endDate) {
                dateRange.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }
            const nights = dateRange.length;
            let totalPrice = 0;
            for (const date of dateRange) {
                const inventory = await roomInventory_model_1.default.findOne({
                    hotelId,
                    roomTypeId,
                    date: {
                        $gte: new Date(date.setHours(0, 0, 0, 0)),
                        $lt: new Date(date.setHours(23, 59, 59, 999)),
                    },
                }).session(session);
                if (!inventory) {
                    await session.abortTransaction();
                    return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin phòng' });
                }
                const availableRooms = inventory.totalInventory - inventory.bookedCount;
                if (availableRooms < roomCount) {
                    await session.abortTransaction();
                    return res.status(400).json({
                        success: false,
                        message: `Chỉ còn ${availableRooms} phòng vào ngày ${date.toISOString().split('T')[0]}`,
                    });
                }
                totalPrice += inventory.priceAtDate * roomCount;
            }
            // Tạo Booking với status pending (chờ thanh toán)
            const newBooking = new booking_model_1.default({
                userId,
                hotelId,
                roomTypeId,
                checkIn: startDate,
                checkOut: endDate,
                nights,
                roomCount,
                totalPrice,
                status: 'pending',
                guestInfo,
                paymentMethod: 'bank_transfer',
                paymentStatus: 'unpaid',
            });
            await newBooking.save({ session });
            // Giữ phòng (cập nhật bookedCount)
            for (const date of dateRange) {
                await roomInventory_model_1.default.findOneAndUpdate({
                    hotelId,
                    roomTypeId,
                    date: {
                        $gte: new Date(date.setHours(0, 0, 0, 0)),
                        $lt: new Date(date.setHours(23, 59, 59, 999)),
                    },
                }, { $inc: { bookedCount: roomCount } }, { session });
            }
            await session.commitTransaction();
            // Tạo PayOS payment link sau khi commit
            const hotel = await hotel_model_1.default.findOne({ hotelId });
            const hotelName = hotel?.name || 'OwnTrip';
            const description = `Dat phong ${hotelName}`.slice(0, 25);
            let checkoutUrl = null;
            let orderCode = null;
            try {
                const payosBody = {
                    orderCode: Number(String(Date.now()).slice(-6)),
                    amount: totalPrice,
                    description,
                    returnUrl: `${YOUR_DOMAIN}/payment/success?bookingId=${newBooking.bookingId}`,
                    cancelUrl: `${YOUR_DOMAIN}/payment/cancel?bookingId=${newBooking.bookingId}`,
                    items: [
                        {
                            name: `${hotelName} - ${nights} đêm`,
                            quantity: roomCount,
                            price: Math.floor(totalPrice / roomCount),
                        },
                    ],
                };
                // v2 SDK: payOS.paymentRequests.create(...)
                const paymentLinkRes = await payos_1.default.paymentRequests.create(payosBody);
                checkoutUrl = paymentLinkRes.checkoutUrl;
                orderCode = paymentLinkRes.orderCode;
                await booking_model_1.default.findOneAndUpdate({ bookingId: newBooking.bookingId }, { payosOrderCode: orderCode, payosCheckoutUrl: checkoutUrl });
            }
            catch (payosError) {
                console.error('[PayOS] Tạo link thất bại, booking vẫn được tạo:', payosError.message);
            }
            return res.status(201).json({
                success: true,
                message: 'Tạo đặt phòng thành công. Vui lòng thanh toán để xác nhận.',
                data: {
                    bookingId: newBooking.bookingId,
                    totalPrice,
                    nights,
                    status: 'pending',
                    paymentMethod: 'bank_transfer',
                    checkoutUrl,
                    orderCode,
                },
            });
        }
        catch (error) {
            await session.abortTransaction();
            console.error('[PayOS] createBookingWithPayment error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
        finally {
            session.endSession();
        }
    },
    /**
     * Internal: Xử lý thanh toán thành công từ webhook hoặc polling
     */
    _handleSuccessfulPayment: async (webhookData) => {
        const { orderCode } = webhookData;
        const booking = await booking_model_1.default.findOne({ payosOrderCode: orderCode });
        if (!booking) {
            console.warn('[PayOS] Không tìm thấy booking với orderCode:', orderCode);
            return;
        }
        if (booking.paymentStatus === 'paid') {
            return;
        }
        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        await booking.save();
        // Cộng doanh thu cho chủ khách sạn
        const hotel = await hotel_model_1.default.findOne({ hotelId: booking.hotelId });
        if (hotel && hotel.ownerId) {
            await user_model_1.default.findOneAndUpdate({ userId: hotel.ownerId }, { $inc: { balance: booking.totalPrice } });
        }
        // Tích điểm cho người dùng (1 điểm / 1000 VND)
        const pointsEarned = Math.floor(booking.totalPrice / 1000);
        await user_model_1.default.findOneAndUpdate({ userId: booking.userId }, { $inc: { points: pointsEarned } });
        // Gửi email xác nhận
        if (hotel && booking.guestInfo?.email) {
            (0, emailService_1.sendEmailTemplate)(booking.guestInfo.email, '✅ Thanh toán và đặt phòng thành công', 'bookingConfirmation', {
                fullName: booking.guestInfo.fullName,
                bookingId: booking.bookingId,
                hotelName: hotel.name,
                checkIn: booking.checkIn.toString(),
                checkOut: booking.checkOut.toString(),
                roomCount: booking.roomCount.toString(),
                totalPrice: booking.totalPrice.toLocaleString(),
            }).catch((err) => console.error('[PayOS] Email error:', err));
        }
        console.log(`[PayOS] Booking ${booking.bookingId} đã thanh toán thành công.`);
    },
    /**
     * Internal: Xử lý nạp tiền thành công
     */
    _handleSuccessfulTopup: async (webhookData) => {
        const { orderCode } = webhookData;
        const Topup = require('../models/topup.model').default;
        const topup = await Topup.findOne({ orderCode });
        if (!topup || topup.status === 'paid')
            return;
        topup.status = 'paid';
        await topup.save();
        if (topup.bookingId.startsWith('topup_')) {
            await user_model_1.default.findOneAndUpdate({ userId: topup.userId }, { $inc: { balance: topup.amount } });
        }
        else if (topup.bookingId.startsWith('temp_') && topup.hotelId) {
            // Trường hợp gia hạn phòng (Edit stay): Chuyển tiền cho chủ khách sạn
            const hotel = await hotel_model_1.default.findOne({ $or: [{ hotelId: topup.hotelId }, { _id: topup.hotelId }] });
            if (hotel && hotel.ownerId) {
                await user_model_1.default.findOneAndUpdate({ userId: hotel.ownerId }, { $inc: { balance: topup.amount } });
                // Tạo một Booking giả để nó xuất hiện trong danh sách Giao dịch của chủ khách sạn
                try {
                    await booking_model_1.default.create({
                        userId: topup.userId,
                        hotelId: topup.hotelId,
                        roomTypeId: 'extension',
                        checkIn: new Date(),
                        checkOut: new Date(),
                        nights: 1,
                        roomCount: 1,
                        totalPrice: topup.amount,
                        status: 'confirmed',
                        paymentStatus: 'paid',
                        paymentMethod: 'credit_card',
                        guestInfo: {
                            fullName: 'Thanh toán gia hạn phòng',
                            email: 'guest@owntrip.vn',
                            phone: '0000000000',
                            specialRequests: `Phụ phí gia hạn cho giao dịch ${topup.bookingId}`
                        }
                    });
                }
                catch (e) {
                    console.error('[PayOS] Error creating extension booking record:', e);
                }
            }
        }
        console.log(`[PayOS] Giao dịch ${topup.bookingId} thành công.`);
    },
};
