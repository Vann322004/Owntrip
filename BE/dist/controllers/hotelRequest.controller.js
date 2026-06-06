"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelRequestController = void 0;
const hotelRequest_model_1 = __importDefault(require("../models/hotelRequest.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const hotel_model_1 = __importDefault(require("../models/hotel.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
exports.HotelRequestController = {
    // POST /api/hotel-requests
    // User submits a registration request
    submitRequest: async (req, res) => {
        try {
            const { hotelName, address, city, phone, description, images, legalDocuments, amenities, businessPolicies } = req.body;
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Không tìm thấy thông tin người dùng' });
            }
            // Check if user already has a pending request
            const existingRequest = await hotelRequest_model_1.default.findOne({ userId, status: 'pending' });
            if (existingRequest) {
                return res.status(400).json({ success: false, message: 'Bạn đã có một đơn đăng ký đang chờ duyệt' });
            }
            const newRequest = new hotelRequest_model_1.default({
                userId,
                hotelName,
                address,
                city,
                phone,
                description,
                images,
                legalDocuments,
                amenities,
                businessPolicies
            });
            await newRequest.save();
            // Create notifications for all admin users
            try {
                const admins = await user_model_1.default.find({ role: 'admin' });
                const user = await user_model_1.default.findOne({ userId });
                for (const admin of admins) {
                    await notification_model_1.default.create({
                        userId: admin.userId,
                        title: "Đơn đăng ký đối tác mới",
                        message: `Khách sạn ${hotelName} được đăng ký bởi ${user?.displayName || user?.email || 'N/A'}.`
                    });
                }
            }
            catch (err) {
                console.error("Failed to notify admins about hotel request:", err);
            }
            res.status(201).json({
                success: true,
                message: 'Đơn đăng ký của bạn đã được gửi và đang chờ duyệt',
                data: newRequest
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    // GET /api/hotel-requests
    // Admin views all requests
    getAllRequests: async (req, res) => {
        try {
            const requests = await hotelRequest_model_1.default.find().sort({ createdAt: -1 });
            res.json({ success: true, data: requests });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    // GET /api/hotel-requests/me
    // User views their own requests
    getMyRequests: async (req, res) => {
        try {
            const userId = req.user?.userId;
            const requests = await hotelRequest_model_1.default.find({ userId }).sort({ createdAt: -1 });
            res.json({ success: true, data: requests });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    // PATCH /api/hotel-requests/:id/status
    // Admin updates request status (approve/reject)
    updateStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, adminComment } = req.body;
            if (!['approved', 'rejected'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
            }
            const request = await hotelRequest_model_1.default.findById(id);
            if (!request) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đăng ký' });
            }
            request.status = status;
            if (adminComment) {
                request.adminComment = adminComment;
            }
            await request.save();
            // Create notification for the user about the status update
            try {
                await notification_model_1.default.create({
                    userId: request.userId,
                    title: status === 'approved' ? "🎉 Đăng ký đối tác thành công" : "❌ Đơn đăng ký đối tác bị từ chối",
                    message: status === 'approved'
                        ? `Chúc mừng! Yêu cầu đăng ký đối tác cho khách sạn ${request.hotelName} của bạn đã được duyệt.`
                        : `Yêu cầu đăng ký đối tác cho khách sạn ${request.hotelName} đã bị từ chối. Lý do: ${adminComment || 'Không có lý do cụ thể'}.`
                });
            }
            catch (err) {
                console.error("Failed to notify user about hotel request update:", err);
            }
            // If approved, update user role AND create hotel record
            if (status === 'approved') {
                await user_model_1.default.findOneAndUpdate({ userId: request.userId }, { role: 'hotel_owner' });
                // Create the actual hotel record from request data
                const newHotel = new hotel_model_1.default({
                    name: request.hotelName,
                    address: {
                        fullAddress: request.address,
                        city: request.city
                    },
                    images: request.images,
                    description: request.description,
                    ownerId: request.userId,
                    starRating: 4, // Default
                    amenities: request.amenities || [],
                    businessPolicies: request.businessPolicies,
                    tags: [],
                    rooms: []
                });
                await newHotel.save();
            }
            res.json({
                success: true,
                message: `Đơn đăng ký đã được ${status === 'approved' ? 'duyệt' : 'từ chối'}`,
                data: request
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
