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
const notification_model_1 = __importDefault(require("../models/notification.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
const trip_controller_1 = require("./trip.controller");
const creatorSubscriptionTransaction_model_1 = __importDefault(require("../models/creatorSubscriptionTransaction.model"));
const wallet_model_1 = __importDefault(require("../models/wallet.model"));
const getCommissionRates = async () => {
    const SystemConfig = require('../models/systemConfig.model').default;
    const configs = await SystemConfig.find({ key: { $in: ['commission_hotel_owner_percent', 'commission_hotel_admin_percent'] } });
    const configMap = {};
    configs.forEach((c) => { configMap[c.key] = c.value; });
    return {
        ownerPercent: (configMap['commission_hotel_owner_percent'] ?? 90) / 100,
        adminPercent: (configMap['commission_hotel_admin_percent'] ?? 10) / 100,
    };
};
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
    _handleSuccessfulCreatorSubscription: async (webhookData) => {
        try {
            const tx = await creatorSubscriptionTransaction_model_1.default.findOne({ orderCode: webhookData.orderCode }).populate('packageId');
            if (!tx || tx.status === 'success')
                return;
            const pkg = tx.packageId;
            if (!pkg)
                return;
            const user = await user_model_1.default.findOne({ userId: tx.userId });
            if (!user)
                return;
            // Tính ngày hết hạn
            const now = new Date();
            let newEndsAt = new Date();
            if (user.creatorSubscriptionEndsAt && user.creatorSubscriptionEndsAt > now) {
                newEndsAt = new Date(user.creatorSubscriptionEndsAt);
            }
            newEndsAt.setMonth(newEndsAt.getMonth() + pkg.durationInMonths);
            user.role = 'creator';
            user.creatorSubscriptionEndsAt = newEndsAt;
            await user.save();
            tx.status = 'success';
            await tx.save();
            // Update admin wallet (revenue)
            let adminWallet = await wallet_model_1.default.findOne({ isSystem: true });
            if (!adminWallet) {
                adminWallet = new wallet_model_1.default({ isSystem: true, balance: 0 });
            }
            adminWallet.balance += tx.amount;
            await adminWallet.save();
            console.log(`[PayOS] Mua goi Creator thanh cong cho user: ${user.userId}`);
        }
        catch (error) {
            console.error('[PayOS] handleSuccessfulCreatorSubscription error:', error);
            throw error;
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
                    const tripOrder = await order_model_1.default.findOne({ orderCode: webhookData.orderCode });
                    if (tripOrder) {
                        await (0, trip_controller_1.processTripOrder)(webhookData.orderCode);
                    }
                    else {
                        const creatorTx = await creatorSubscriptionTransaction_model_1.default.findOne({ orderCode: webhookData.orderCode });
                        if (creatorTx) {
                            await exports.PaymentController._handleSuccessfulCreatorSubscription(webhookData);
                        }
                        else {
                            await exports.PaymentController._handleSuccessfulPayment(webhookData);
                        }
                    }
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
            if (String(bookingId).startsWith('creator_')) {
                const orderCode = Number(String(bookingId).split('_')[1]);
                const tx = await creatorSubscriptionTransaction_model_1.default.findOne({ orderCode });
                if (!tx) {
                    return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch mua gói Creator' });
                }
                let payosStatus = null;
                try {
                    payosStatus = await payos_1.default.paymentRequests.get(tx.orderCode);
                    if (payosStatus.status === 'PAID' && tx.status !== 'success') {
                        await exports.PaymentController._handleSuccessfulCreatorSubscription({ orderCode: tx.orderCode });
                        tx.status = 'success';
                    }
                }
                catch (e) { }
                return res.status(200).json({
                    success: true,
                    data: {
                        bookingId: `creator_${tx.orderCode}`,
                        paymentStatus: tx.status === 'success' ? 'paid' : 'unpaid',
                        bookingStatus: tx.status,
                        totalPrice: tx.amount,
                        payosStatus: payosStatus?.status || null,
                        checkoutUrl: null,
                    },
                });
            }
            // Check for trip order
            if (!isNaN(Number(bookingId))) {
                const order = await order_model_1.default.findOne({ orderCode: Number(bookingId) });
                if (order) {
                    let payosStatus = null;
                    let clonedTripId = null;
                    let processError = null;
                    try {
                        payosStatus = await payos_1.default.paymentRequests.get(order.orderCode);
                        if (payosStatus.status === 'PAID' && order.status !== 'SUCCESS') {
                            await (0, trip_controller_1.processTripOrder)(order.orderCode);
                            order.status = 'SUCCESS';
                        }
                    }
                    catch (e) {
                        console.error('[PayOS] checkPaymentStatus error processing trip order:', e);
                        processError = e.message || String(e);
                        // If processTripOrder fails, we should not consider the order as SUCCESS in memory.
                    }
                    if (order.status === 'SUCCESS') {
                        const TripModel = require('../models/trip.model').default;
                        const clonedTrip = await TripModel.findOne({ originalTripId: order.tripTemplateId, userId: order.buyerId, isPurchasedClone: true }).sort({ createdAt: -1 });
                        clonedTripId = clonedTrip?._id;
                    }
                    return res.status(200).json({
                        success: true,
                        data: {
                            bookingId: order.orderCode.toString(),
                            paymentStatus: order.status === 'SUCCESS' ? 'paid' : 'unpaid',
                            bookingStatus: order.status,
                            totalPrice: order.amount,
                            payosStatus: payosStatus?.status || null,
                            checkoutUrl: null,
                            newTripId: clonedTripId,
                            processError: processError
                        },
                    });
                }
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
            // 4. Kiểm tra số dư người dùng
            const user = await user_model_1.default.findOne({ userId }).session(session);
            if (!user) {
                await session.abortTransaction();
                return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
            }
            const isBalanceEnough = user.balance >= totalPrice;
            // 5. Tạo Booking
            const newBooking = new booking_model_1.default({
                userId,
                hotelId,
                roomTypeId,
                checkIn: startDate,
                checkOut: endDate,
                nights,
                roomCount,
                totalPrice,
                status: isBalanceEnough ? 'confirmed' : 'pending',
                guestInfo,
                paymentMethod: isBalanceEnough ? 'balance' : 'bank_transfer',
                paymentStatus: isBalanceEnough ? 'paid' : 'unpaid',
            });
            await newBooking.save({ session });
            // 6. Giữ phòng (cập nhật bookedCount)
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
            // 7. Nếu dùng số dư: Trừ tiền user & Cộng tiền chủ khách sạn
            if (isBalanceEnough) {
                const pointsEarned = Math.floor(totalPrice / 1000);
                await user_model_1.default.findOneAndUpdate({ userId }, {
                    $inc: {
                        balance: -totalPrice,
                        points: pointsEarned
                    }
                }, { session });
                const hotelDoc = await hotel_model_1.default.findOne({ hotelId }).session(session);
                if (hotelDoc && hotelDoc.ownerId) {
                    const rates = await getCommissionRates();
                    const ownerAmount = Math.floor(totalPrice * rates.ownerPercent);
                    const adminAmount = totalPrice - ownerAmount;
                    await user_model_1.default.findOneAndUpdate({ userId: hotelDoc.ownerId }, { $inc: { balance: ownerAmount } }, { session });
                    await wallet_model_1.default.findOneAndUpdate({ isSystem: true }, {
                        $inc: { balance: adminAmount },
                        $setOnInsert: { isSystem: true, currency: "VND" }
                    }, { new: true, upsert: true, session });
                }
            }
            await session.commitTransaction();
            // 8. Nếu thanh toán thành công bằng số dư -> Trả kết quả ngay
            if (isBalanceEnough) {
                const hotel = await hotel_model_1.default.findOne({ hotelId });
                const hotelName = hotel?.name || 'khách sạn';
                // Tạo thông báo trong app
                await notification_model_1.default.create({
                    userId,
                    title: "✅ Đặt phòng thành công",
                    message: `Bạn đã đặt thành công ${roomCount} phòng tại ${hotelName} (${nights} đêm). Số tiền ${totalPrice.toLocaleString()} VND đã được trừ từ số dư.`,
                });
                if (hotel && guestInfo.email) {
                    (0, emailService_1.sendEmailTemplate)(guestInfo.email, '✅ Xác nhận đặt phòng thành công', 'bookingConfirmation', {
                        fullName: guestInfo.fullName,
                        bookingId: newBooking.bookingId,
                        hotelName: hotel.name,
                        checkIn: checkIn,
                        checkOut: checkOut,
                        roomCount: roomCount.toString(),
                        totalPrice: totalPrice.toLocaleString()
                    }).catch((err) => console.error('[Balance Payment] Email error:', err));
                }
                return res.status(201).json({
                    success: true,
                    message: 'Đặt phòng thành công! Số dư của bạn đã được trừ.',
                    data: {
                        bookingId: newBooking.bookingId,
                        totalPrice,
                        nights,
                        status: 'confirmed',
                        paymentMethod: 'balance',
                    },
                });
            }
            // 9. Nếu số dư không đủ -> Tạo PayOS payment link
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
                const paymentLinkRes = await payos_1.default.paymentRequests.create(payosBody);
                checkoutUrl = paymentLinkRes.checkoutUrl;
                orderCode = paymentLinkRes.orderCode;
                await booking_model_1.default.findOneAndUpdate({ bookingId: newBooking.bookingId }, { payosOrderCode: orderCode, payosCheckoutUrl: checkoutUrl });
            }
            catch (payosError) {
                console.error('[PayOS] Tạo link thất bại:', payosError.message);
            }
            return res.status(201).json({
                success: true,
                message: 'Số dư không đủ. Vui lòng thanh toán qua QR để xác nhận đặt phòng.',
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
        // Tạo thông báo trong app
        await notification_model_1.default.create({
            userId: booking.userId,
            title: "✅ Thanh toán thành công",
            message: `Đơn đặt phòng ${booking.bookingId} tại ${hotel?.name || 'khách sạn'} đã được thanh toán thành công qua PayOS.`,
        });
        if (hotel && hotel.ownerId) {
            const rates = await getCommissionRates();
            const ownerAmount = Math.floor(booking.totalPrice * rates.ownerPercent);
            const adminAmount = booking.totalPrice - ownerAmount;
            await user_model_1.default.findOneAndUpdate({ userId: hotel.ownerId }, { $inc: { balance: ownerAmount } });
            await wallet_model_1.default.findOneAndUpdate({ isSystem: true }, {
                $inc: { balance: adminAmount },
                $setOnInsert: { isSystem: true, currency: "VND" }
            }, { new: true, upsert: true });
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
        if (topup.bookingId.startsWith('topup_points_')) {
            const pointsEarned = Math.floor(topup.amount / 1000);
            await user_model_1.default.findOneAndUpdate({ userId: topup.userId }, { $inc: { points: pointsEarned } });
            // Add to admin wallet
            let adminWallet = await wallet_model_1.default.findOne({ isSystem: true });
            if (!adminWallet) {
                adminWallet = new wallet_model_1.default({ isSystem: true, balance: 0 });
            }
            adminWallet.balance += topup.amount;
            await adminWallet.save();
        }
        else if (topup.bookingId.startsWith('topup_')) {
            await user_model_1.default.findOneAndUpdate({ userId: topup.userId }, { $inc: { balance: topup.amount } });
        }
        else if (topup.bookingId.startsWith('temp_') && topup.hotelId) {
            // Trường hợp gia hạn phòng (Edit stay): Chuyển tiền cho chủ khách sạn
            const hotel = await hotel_model_1.default.findOne({ $or: [{ hotelId: topup.hotelId }, { _id: topup.hotelId }] });
            if (hotel && hotel.ownerId) {
                const rates = await getCommissionRates();
                const ownerAmount = Math.floor(topup.amount * rates.ownerPercent);
                const adminAmount = topup.amount - ownerAmount;
                await user_model_1.default.findOneAndUpdate({ userId: hotel.ownerId }, { $inc: { balance: ownerAmount } });
                await wallet_model_1.default.findOneAndUpdate({ isSystem: true }, {
                    $inc: { balance: adminAmount },
                    $setOnInsert: { isSystem: true, currency: "VND" }
                }, { new: true, upsert: true });
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
