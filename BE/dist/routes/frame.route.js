"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const frame_controller_1 = require("../controllers/frame.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
// ─── PUBLIC ──────────────────────────────────────────────────────────────────
// GET /api/frames — Lấy danh sách frame đang active (dùng cho app mobile)
router.get("/", frame_controller_1.getFrames);
// ─── ADMIN ───────────────────────────────────────────────────────────────────
// GET /api/frames/admin — Lấy tất cả frame kể cả frame đang ẩn
// QUAN TRỌNG: route tĩnh (/admin, /reorder) phải đứng TRƯỚC route động (/:id)
router.get("/admin", auth_middleware_1.verifyToken, (0, auth_middleware_1.authorizeRole)("admin"), frame_controller_1.getAllFramesAdmin);
// PATCH /api/frames/reorder — Cập nhật thứ tự hàng loạt
router.patch("/reorder", auth_middleware_1.verifyToken, (0, auth_middleware_1.authorizeRole)("admin"), frame_controller_1.reorderFrames);
// POST /api/frames — Tạo frame mới + upload ảnh lên Cloudinary
// multipart/form-data, field ảnh là "image"
router.post("/", auth_middleware_1.verifyToken, (0, auth_middleware_1.authorizeRole)("admin"), upload_middleware_1.uploadFrame.single("image"), // ← multer middleware: nhận 1 file field "image"
frame_controller_1.createFrame);
// PUT /api/frames/:id — Cập nhật frame (có thể kèm ảnh mới)
// field "image" là tùy chọn — nếu không gửi thì giữ nguyên ảnh cũ
router.put("/:id", auth_middleware_1.verifyToken, (0, auth_middleware_1.authorizeRole)("admin"), upload_middleware_1.uploadFrame.single("image"), // ← tùy chọn: nếu không có file thì req.file = undefined
frame_controller_1.updateFrame);
// DELETE /api/frames/:id — Xóa vĩnh viễn frame + ảnh Cloudinary
router.delete("/:id", auth_middleware_1.verifyToken, (0, auth_middleware_1.authorizeRole)("admin"), frame_controller_1.deleteFrame);
// PATCH /api/frames/:id/toggle — Bật/tắt trạng thái hiển thị frame
router.patch("/:id/toggle", auth_middleware_1.verifyToken, (0, auth_middleware_1.authorizeRole)("admin"), frame_controller_1.toggleFrameActive);
module.exports = router;
