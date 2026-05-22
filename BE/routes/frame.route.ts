import { Router } from "express";
import {
  getFrames,
  getAllFramesAdmin,
  createFrame,
  updateFrame,
  deleteFrame,
  toggleFrameActive,
  reorderFrames
} from "../controllers/frame.controller";
import { verifyToken, authorizeRole } from "../middlewares/auth.middleware";
import { uploadFrame } from "../middlewares/upload.middleware";

const router = Router();

// ─── PUBLIC ──────────────────────────────────────────────────────────────────
// GET /api/frames — Lấy danh sách frame đang active (dùng cho app mobile)
router.get("/", getFrames);

// ─── ADMIN ───────────────────────────────────────────────────────────────────
// GET /api/frames/admin — Lấy tất cả frame kể cả frame đang ẩn
// QUAN TRỌNG: route tĩnh (/admin, /reorder) phải đứng TRƯỚC route động (/:id)
router.get("/admin", verifyToken, authorizeRole("admin"), getAllFramesAdmin);

// PATCH /api/frames/reorder — Cập nhật thứ tự hàng loạt
router.patch("/reorder", verifyToken, authorizeRole("admin"), reorderFrames);

// POST /api/frames — Tạo frame mới + upload ảnh lên Cloudinary
// multipart/form-data, field ảnh là "image"
router.post(
  "/",
  verifyToken,
  authorizeRole("admin"),
  uploadFrame.single("image"),  // ← multer middleware: nhận 1 file field "image"
  createFrame
);

// PUT /api/frames/:id — Cập nhật frame (có thể kèm ảnh mới)
// field "image" là tùy chọn — nếu không gửi thì giữ nguyên ảnh cũ
router.put(
  "/:id",
  verifyToken,
  authorizeRole("admin"),
  uploadFrame.single("image"),  // ← tùy chọn: nếu không có file thì req.file = undefined
  updateFrame
);

// DELETE /api/frames/:id — Xóa vĩnh viễn frame + ảnh Cloudinary
router.delete("/:id", verifyToken, authorizeRole("admin"), deleteFrame);

// PATCH /api/frames/:id/toggle — Bật/tắt trạng thái hiển thị frame
router.patch("/:id/toggle", verifyToken, authorizeRole("admin"), toggleFrameActive);

module.exports = router;
