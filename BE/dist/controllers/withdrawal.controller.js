"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewWithdrawalRequest = exports.getAllWithdrawalRequestsForAdmin = exports.getMyWithdrawalRequests = exports.createWithdrawalRequest = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../models/user.model"));
const withdrawalRequest_model_1 = __importDefault(require("../models/withdrawalRequest.model"));
const normalizeAmount = (raw) => Number(raw);
const createWithdrawalRequest = async (req, res) => {
    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!userId) {
        return res.status(401).json({ success: false, message: "Bạn cần đăng nhập" });
    }
    if (role !== "creator") {
        return res.status(403).json({ success: false, message: "Chỉ Creator mới có thể tạo yêu cầu rút tiền" });
    }
    const { amount, bankName, accountNumber, accountName } = req.body;
    const parsedAmount = normalizeAmount(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ success: false, message: "Số tiền rút không hợp lệ" });
    }
    if (!bankName || !accountNumber || !accountName) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin ngân hàng" });
    }
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user = await user_model_1.default.findOne({ userId }).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }
        if (user.balance < parsedAmount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Số dư không đủ để rút tiền" });
        }
        user.balance -= parsedAmount;
        await user.save({ session });
        const request = await withdrawalRequest_model_1.default.create([
            {
                userId,
                amount: parsedAmount,
                bankName,
                accountNumber,
                accountName,
                status: "pending"
            }
        ], { session });
        await session.commitTransaction();
        session.endSession();
        return res.status(201).json({
            success: true,
            message: "Tạo yêu cầu rút tiền thành công",
            data: request[0],
            currentBalance: user.balance
        });
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ success: false, message: error.message || "Tạo yêu cầu thất bại" });
    }
};
exports.createWithdrawalRequest = createWithdrawalRequest;
const getMyWithdrawalRequests = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: "Bạn cần đăng nhập" });
    }
    try {
        const data = await withdrawalRequest_model_1.default.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Không thể tải lịch sử rút tiền" });
    }
};
exports.getMyWithdrawalRequests = getMyWithdrawalRequests;
const getAllWithdrawalRequestsForAdmin = async (_req, res) => {
    try {
        const data = await withdrawalRequest_model_1.default.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Không thể tải danh sách yêu cầu" });
    }
};
exports.getAllWithdrawalRequestsForAdmin = getAllWithdrawalRequestsForAdmin;
const reviewWithdrawalRequest = async (req, res) => {
    const { id } = req.params;
    const { action, status, adminNote } = req.body;
    const decision = action || status;
    if (decision !== "approved" && decision !== "rejected") {
        return res.status(400).json({ success: false, message: "Trạng thái xử lý không hợp lệ" });
    }
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const request = await withdrawalRequest_model_1.default.findById(id).session(session);
        if (!request) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Không tìm thấy yêu cầu rút tiền" });
        }
        if (request.status !== "pending") {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Yêu cầu này đã được xử lý trước đó" });
        }
        request.status = decision;
        request.adminNote = adminNote;
        if (decision === "rejected") {
            await user_model_1.default.findOneAndUpdate({ userId: request.userId }, { $inc: { balance: request.amount } }, { session });
        }
        await request.save({ session });
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json({
            success: true,
            message: decision === "approved" ? "Đã duyệt yêu cầu rút tiền" : "Đã từ chối yêu cầu và hoàn tiền cho Creator",
            data: request
        });
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ success: false, message: error.message || "Xử lý yêu cầu thất bại" });
    }
};
exports.reviewWithdrawalRequest = reviewWithdrawalRequest;
