"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const system_controller_1 = require("../controllers/system.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
// Chỉ Admin mới được xem/sửa cài đặt hệ thống
router.get('/info', auth_middleware_1.verifyToken, (0, auth_middleware_1.authorizeRole)(['admin']), system_controller_1.SystemController.getSystemInfo);
router.get('/config', auth_middleware_1.verifyToken, (0, auth_middleware_1.authorizeRole)(['admin']), system_controller_1.SystemController.getConfig);
router.post('/config', auth_middleware_1.verifyToken, (0, auth_middleware_1.authorizeRole)(['admin']), system_controller_1.SystemController.updateConfig);
router.get('/dashboard-stats', auth_middleware_1.verifyToken, (0, auth_middleware_1.authorizeRole)(['admin']), system_controller_1.SystemController.getDashboardStats);
router.get('/hotel-owners', auth_middleware_1.verifyToken, (0, auth_middleware_1.authorizeRole)(['admin']), system_controller_1.SystemController.getHotelOwners);
router.get('/point-topups', auth_middleware_1.verifyToken, (0, auth_middleware_1.authorizeRole)(['admin']), system_controller_1.SystemController.getPointTopups);
// Upload ảnh khách sạn lên Cloudinary (hotel_owner hoặc admin)
router.post('/upload-image', auth_middleware_1.verifyToken, upload_middleware_1.uploadHotelImage.single('image'), system_controller_1.SystemController.uploadImage);
module.exports = router;
