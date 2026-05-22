"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeToPackage = exports.getActivePackages = exports.getAllPackagesAdmin = exports.deletePackage = exports.updatePackage = exports.createPackage = void 0;
const creatorPackage_model_1 = __importDefault(require("../models/creatorPackage.model"));
const creatorSubscriptionTransaction_model_1 = __importDefault(require("../models/creatorSubscriptionTransaction.model"));
const payos_1 = __importDefault(require("../utils/payos"));
// ======================= ADMIN APIs =======================
const createPackage = async (req, res) => {
    try {
        const { name, durationInMonths, price, description } = req.body;
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        const newPackage = new creatorPackage_model_1.default({
            name,
            durationInMonths,
            price,
            description
        });
        await newPackage.save();
        return res.status(201).json({ success: true, data: newPackage });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.createPackage = createPackage;
const updatePackage = async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        const { id } = req.params;
        const updateData = req.body;
        const updatedPackage = await creatorPackage_model_1.default.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedPackage) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }
        return res.json({ success: true, data: updatedPackage });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updatePackage = updatePackage;
const deletePackage = async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        const { id } = req.params;
        const deletedPackage = await creatorPackage_model_1.default.findByIdAndDelete(id);
        if (!deletedPackage) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }
        return res.json({ success: true, message: 'Deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.deletePackage = deletePackage;
const getAllPackagesAdmin = async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        const packages = await creatorPackage_model_1.default.find().sort({ price: 1 });
        return res.json({ success: true, data: packages });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getAllPackagesAdmin = getAllPackagesAdmin;
// ======================= USER APIs =======================
const getActivePackages = async (req, res) => {
    try {
        const packages = await creatorPackage_model_1.default.find({ isActive: true }).sort({ price: 1 });
        return res.json({ success: true, data: packages });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getActivePackages = getActivePackages;
const subscribeToPackage = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { packageId } = req.body;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const pkg = await creatorPackage_model_1.default.findOne({ _id: packageId, isActive: true });
        if (!pkg) {
            return res.status(404).json({ success: false, message: 'Package not found or inactive' });
        }
        const orderCode = Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000));
        const transaction = new creatorSubscriptionTransaction_model_1.default({
            userId,
            packageId: pkg._id,
            amount: pkg.price,
            orderCode,
            status: 'pending'
        });
        await transaction.save();
        // Create PayOS payment link
        const paymentData = {
            orderCode,
            amount: pkg.price,
            description: `Mua goi Creator`,
            returnUrl: `http://localhost:8081/payment/success?orderCode=${orderCode}`,
            cancelUrl: `http://localhost:8081/payment/cancel?orderCode=${orderCode}`,
        };
        const paymentLinkRes = await payos_1.default.paymentRequests.create(paymentData);
        return res.json({
            success: true,
            checkoutUrl: paymentLinkRes.checkoutUrl,
            bookingId: `creator_${orderCode}`,
            orderCode
        });
    }
    catch (error) {
        console.error('Subscribe to package error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.subscribeToPackage = subscribeToPackage;
