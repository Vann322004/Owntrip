import { Request, Response } from 'express';
import { Request as ExpressReq, Response as ExpressRes } from 'express';
import CreatorPackage from '../models/creatorPackage.model';
import CreatorSubscriptionTransaction from '../models/creatorSubscriptionTransaction.model';
import User from '../models/user.model';
import Wallet from '../models/wallet.model';
import payOS from '../utils/payos';

interface AuthRequest extends ExpressReq {
  user?: {
    userId: string;
    role: string;
  };
}

// ======================= ADMIN APIs =======================

export const createPackage = async (req: AuthRequest, res: ExpressRes) => {
  try {
    const { name, durationInMonths, price, description } = req.body;
    
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const newPackage = new CreatorPackage({
      name,
      durationInMonths,
      price,
      description
    });

    await newPackage.save();
    return res.status(201).json({ success: true, data: newPackage });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updatePackage = async (req: AuthRequest, res: ExpressRes) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { id } = req.params;
    const updateData = req.body;

    const updatedPackage = await CreatorPackage.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedPackage) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    return res.json({ success: true, data: updatedPackage });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deletePackage = async (req: AuthRequest, res: ExpressRes) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { id } = req.params;
    const deletedPackage = await CreatorPackage.findByIdAndDelete(id);
    if (!deletedPackage) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    return res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllPackagesAdmin = async (req: AuthRequest, res: ExpressRes) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const packages = await CreatorPackage.find().sort({ price: 1 });
    return res.json({ success: true, data: packages });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ======================= USER APIs =======================

export const getActivePackages = async (req: ExpressReq, res: ExpressRes) => {
  try {
    const packages = await CreatorPackage.find({ isActive: true }).sort({ price: 1 });
    return res.json({ success: true, data: packages });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const subscribeToPackage = async (req: AuthRequest, res: ExpressRes) => {
  try {
    const userId = req.user?.userId;
    const { packageId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const pkg = await CreatorPackage.findOne({ _id: packageId, isActive: true });
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found or inactive' });
    }

    const orderCode = Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000));

    const transaction = new CreatorSubscriptionTransaction({
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

    const paymentLinkRes = await payOS.paymentRequests.create(paymentData as any);

    return res.json({
      success: true,
      checkoutUrl: paymentLinkRes.checkoutUrl,
      bookingId: `creator_${orderCode}`,
      orderCode
    });
  } catch (error) {
    console.error('Subscribe to package error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
