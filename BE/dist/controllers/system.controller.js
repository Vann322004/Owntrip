"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemController = void 0;
const systemConfig_model_1 = __importDefault(require("../models/systemConfig.model"));
const mongoose_1 = __importDefault(require("mongoose"));
exports.SystemController = {
    // GET /api/system/info
    getSystemInfo: async (req, res) => {
        try {
            const dbStatus = mongoose_1.default.connection.readyState === 1 ? 'Connected' : 'Disconnected';
            const uptime = process.uptime();
            res.json({
                success: true,
                data: {
                    appName: 'OwnTrip Admin',
                    version: '1.0.0',
                    dbStatus,
                    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
                    nodeVersion: process.version,
                    platform: process.platform,
                    memoryUsage: process.memoryUsage(),
                }
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    // GET /api/system/config
    getConfig: async (req, res) => {
        try {
            const configs = await systemConfig_model_1.default.find();
            // Chuyển mảng thành object cho dễ dùng ở frontend
            const configObj = configs.reduce((acc, curr) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {});
            // Nếu chưa có config nào, trả về mặc định
            if (configs.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        points_per_vnpay_1000: 1,
                        points_daily_login: 10,
                        points_review_bonus: 50,
                    }
                });
            }
            res.json({ success: true, data: configObj });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    // POST /api/system/config
    updateConfig: async (req, res) => {
        try {
            const updates = req.body; // { key1: value1, key2: value2 }
            const operations = Object.keys(updates).map(key => ({
                updateOne: {
                    filter: { key },
                    update: { value: updates[key] },
                    upsert: true
                }
            }));
            await systemConfig_model_1.default.bulkWrite(operations);
            res.json({ success: true, message: 'Cấu hình hệ thống đã được cập nhật' });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    // GET /api/system/dashboard-stats
    getDashboardStats: async (req, res) => {
        try {
            const User = require('../models/user.model').default;
            const Trip = require('../models/trip.model').default;
            const Booking = require('../models/booking.model').default;
            const Order = require('../models/order.model').default;
            const CreatorSubscriptionTransaction = require('../models/creatorSubscriptionTransaction.model').default;
            const Hotel = require('../models/hotel.model').default;
            const HotelRequest = require('../models/hotelRequest.model').default;
            const WithdrawalRequest = require('../models/withdrawalRequest.model').default;
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
            // --- 1. Tổng người dùng ---
            const totalUsers = await User.countDocuments();
            const usersLastMonth = await User.countDocuments({ createdAt: { $lt: startOfMonth } });
            const usersChange = usersLastMonth > 0 ? Math.round(((totalUsers - usersLastMonth) / usersLastMonth) * 100) : 0;
            // --- 2. Tổng khách sạn ---
            const totalHotels = await Hotel.countDocuments();
            const hotelsLastMonth = await Hotel.countDocuments({ createdAt: { $lt: startOfMonth } });
            const hotelsChange = hotelsLastMonth > 0 ? Math.round(((totalHotels - hotelsLastMonth) / hotelsLastMonth) * 100) : 0;
            // --- 2.1 Yêu cầu duyệt Hotel Owner chờ duyệt ---
            const pendingHotelRequests = await HotelRequest.countDocuments({ status: 'pending' });
            // --- 2.2 Yêu cầu rút tiền chờ duyệt ---
            const pendingWithdrawals = await WithdrawalRequest.countDocuments({ status: 'pending' });
            // Keep trips count for API backwards-compatibility
            const tripsThisMonth = await Trip.countDocuments({ createdAt: { $gte: startOfMonth } });
            const tripsLastMonth = await Trip.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } });
            const tripsChange = tripsLastMonth > 0 ? Math.round(((tripsThisMonth - tripsLastMonth) / tripsLastMonth) * 100) : 0;
            // --- 3. Doanh thu (Bookings paid + Orders SUCCESS + Creator subscriptions success) ---
            const bookingRevenue = await Booking.aggregate([
                { $match: { paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]);
            const orderRevenue = await Order.aggregate([
                { $match: { status: 'SUCCESS' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const creatorRevenue = await CreatorSubscriptionTransaction.aggregate([
                { $match: { status: 'success' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const totalRevenue = ((bookingRevenue[0]?.total || 0) * 0.1) +
                (orderRevenue[0]?.total || 0) +
                (creatorRevenue[0]?.total || 0);
            // Revenue this month
            const bookingRevenueThisMonth = await Booking.aggregate([
                { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]);
            const orderRevenueThisMonth = await Order.aggregate([
                { $match: { status: 'SUCCESS', createdAt: { $gte: startOfMonth } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const creatorRevenueThisMonth = await CreatorSubscriptionTransaction.aggregate([
                { $match: { status: 'success', createdAt: { $gte: startOfMonth } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const revenueThisMonth = ((bookingRevenueThisMonth[0]?.total || 0) * 0.1) +
                (orderRevenueThisMonth[0]?.total || 0) +
                (creatorRevenueThisMonth[0]?.total || 0);
            // Revenue last month
            const bookingRevenueLastMonth = await Booking.aggregate([
                { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]);
            const orderRevenueLastMonth = await Order.aggregate([
                { $match: { status: 'SUCCESS', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const creatorRevenueLastMonth = await CreatorSubscriptionTransaction.aggregate([
                { $match: { status: 'success', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const revLastMonth = ((bookingRevenueLastMonth[0]?.total || 0) * 0.1) +
                (orderRevenueLastMonth[0]?.total || 0) +
                (creatorRevenueLastMonth[0]?.total || 0);
            const revenueChange = revLastMonth > 0 ? Math.round(((revenueThisMonth - revLastMonth) / revLastMonth) * 100) : 0;
            // --- 4. Tổng booking ---
            const totalBookings = await Booking.countDocuments();
            const bookingsThisMonth = await Booking.countDocuments({ createdAt: { $gte: startOfMonth } });
            const bookingsLastMonth = await Booking.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } });
            const bookingsChange = bookingsLastMonth > 0 ? Math.round(((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100) : 0;
            // --- 5. Recent bookings ---
            const recentBookings = await Booking.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();
            // Populate user info
            const populatedBookings = await Promise.all(recentBookings.map(async (b) => {
                const user = await User.findOne({ userId: b.userId }).lean();
                const hotel = await Hotel.findOne({ hotelId: b.hotelId }).lean();
                return {
                    id: b.bookingId,
                    user: user?.displayName || b.guestInfo?.fullName || 'N/A',
                    destination: hotel?.name || 'N/A',
                    date: new Date(b.createdAt).toLocaleDateString('vi-VN'),
                    amount: b.totalPrice,
                    status: b.status === 'confirmed' || b.status === 'completed' ? 'Hoàn thành'
                        : b.status === 'pending' ? 'Đang xử lý'
                            : b.status === 'cancelled' ? 'Hủy' : b.status,
                };
            }));
            // --- 6. Monthly revenue chart (12 months) ---
            const monthlyRevenue = [];
            const monthlyRevenueBreakdown = [];
            for (let i = 11; i >= 0; i--) {
                const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
                const bRev = await Booking.aggregate([
                    { $match: { paymentStatus: 'paid', createdAt: { $gte: mStart, $lte: mEnd } } },
                    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
                ]);
                const oRev = await Order.aggregate([
                    { $match: { status: 'SUCCESS', createdAt: { $gte: mStart, $lte: mEnd } } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]);
                const cRev = await CreatorSubscriptionTransaction.aggregate([
                    { $match: { status: 'success', createdAt: { $gte: mStart, $lte: mEnd } } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]);
                const bookingVal = (bRev[0]?.total || 0) * 0.1;
                const orderVal = oRev[0]?.total || 0;
                const creatorVal = cRev[0]?.total || 0;
                const totalVal = bookingVal + orderVal + creatorVal;
                monthlyRevenue.push(totalVal);
                monthlyRevenueBreakdown.push({
                    booking: bookingVal,
                    order: orderVal,
                    creator: creatorVal,
                    total: totalVal
                });
            }
            // --- 7. Admin System Wallet balance ---
            const Wallet = require('../models/wallet.model').default;
            // Drop stale unique index on userId if exists (one-time fix)
            try {
                await Wallet.collection.dropIndex('userId_1');
            }
            catch (e) {
                // index already dropped or doesn't exist, ignore
            }
            const adminWallet = await Wallet.findOne({ isSystem: true });
            const adminWalletBalance = adminWallet?.balance || 0;
            res.json({
                success: true,
                data: {
                    totalUsers,
                    usersChange,
                    totalHotels,
                    hotelsChange,
                    pendingHotelRequests,
                    pendingWithdrawals,
                    tripsThisMonth,
                    tripsChange,
                    totalRevenue,
                    revenueThisMonth,
                    revenueChange,
                    totalBookings,
                    bookingsThisMonth,
                    bookingsChange,
                    recentBookings: populatedBookings,
                    monthlyRevenue,
                    monthlyRevenueBreakdown,
                    adminWalletBalance,
                }
            });
        }
        catch (error) {
            console.error('[Dashboard] Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
