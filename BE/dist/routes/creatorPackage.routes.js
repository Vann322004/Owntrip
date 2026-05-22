"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const creatorPackage_controller_1 = require("../controllers/creatorPackage.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// User APIs
router.get('/', creatorPackage_controller_1.getActivePackages);
router.post('/subscribe', auth_middleware_1.verifyToken, creatorPackage_controller_1.subscribeToPackage);
// Admin APIs
router.post('/admin', auth_middleware_1.verifyToken, (0, auth_middleware_1.authorizeRole)(['admin']), creatorPackage_controller_1.createPackage);
router.put('/admin/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.authorizeRole)(['admin']), creatorPackage_controller_1.updatePackage);
router.delete('/admin/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.authorizeRole)(['admin']), creatorPackage_controller_1.deletePackage);
router.get('/admin', auth_middleware_1.verifyToken, (0, auth_middleware_1.authorizeRole)(['admin']), creatorPackage_controller_1.getAllPackagesAdmin);
module.exports = router;
