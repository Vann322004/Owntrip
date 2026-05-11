"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hotelRequest_controller_1 = require("../controllers/hotelRequest.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// For users
router.post('/', auth_middleware_1.verifyToken, hotelRequest_controller_1.HotelRequestController.submitRequest);
router.get('/me', auth_middleware_1.verifyToken, hotelRequest_controller_1.HotelRequestController.getMyRequests);
// For admins
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.authorizeRole)('admin'), hotelRequest_controller_1.HotelRequestController.getAllRequests);
router.patch('/:id/status', auth_middleware_1.verifyToken, (0, auth_middleware_1.authorizeRole)('admin'), hotelRequest_controller_1.HotelRequestController.updateStatus);
module.exports = router;
