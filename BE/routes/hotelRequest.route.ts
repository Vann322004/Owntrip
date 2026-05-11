import { Router } from 'express';
import { HotelRequestController } from '../controllers/hotelRequest.controller';
import { verifyToken, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

// For users
router.post('/', verifyToken, HotelRequestController.submitRequest);
router.get('/me', verifyToken, HotelRequestController.getMyRequests);

// For admins
router.get('/', verifyToken, authorizeRole('admin'), HotelRequestController.getAllRequests);
router.patch('/:id/status', verifyToken, authorizeRole('admin'), HotelRequestController.updateStatus);

module.exports = router;
