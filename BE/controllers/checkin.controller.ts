import { Response } from "express";
import Checkin from "../models/checkin.model";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createCheckinMemory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { imageUri, title, date } = req.body;
    if (!imageUri) {
      return res.status(400).json({
        success: false,
        message: "imageUri is required"
      });
    }

    // Default current formatted date if not provided
    const checkinDate = date || new Date().toLocaleDateString("vi-VN");

    const checkin = await Checkin.create({
      userId,
      imageUri,
      title: title || "Kỷ niệm Check-in",
      date: checkinDate,
      isFavorite: false
    });

    return res.json({
      success: true,
      message: "Lưu kỷ niệm thành công!",
      checkin
    });
  } catch (error) {
    console.error("Create checkin error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể lưu kỷ niệm",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const getMyCheckins = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const checkins = await Checkin.find({ userId }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      total: checkins.length,
      checkins
    });
  } catch (error) {
    console.error("Get checkins error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách kỷ niệm"
    });
  }
};

export const toggleCheckinFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const checkin = await Checkin.findOne({ _id: id, userId });
    if (!checkin) {
      return res.status(404).json({
        success: false,
        message: "Kỷ niệm không tồn tại hoặc không thuộc quyền sở hữu của bạn"
      });
    }

    checkin.isFavorite = !checkin.isFavorite;
    await checkin.save();

    return res.json({
      success: true,
      message: checkin.isFavorite ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích",
      checkin
    });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật trạng thái yêu thích"
    });
  }
};

export const deleteCheckin = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const checkin = await Checkin.findOneAndDelete({ _id: id, userId });
    if (!checkin) {
      return res.status(404).json({
        success: false,
        message: "Kỷ niệm không tồn tại hoặc không thuộc quyền sở hữu của bạn"
      });
    }

    return res.json({
      success: true,
      message: "Đã xóa kỷ niệm thành công"
    });
  } catch (error) {
    console.error("Delete checkin error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể xóa kỷ niệm"
    });
  }
};
