import { Router } from 'express';
import { 
  createPackage, 
  updatePackage, 
  deletePackage, 
  getAllPackagesAdmin, 
  getActivePackages, 
  subscribeToPackage 
} from '../controllers/creatorPackage.controller';
import { verifyToken, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

// User APIs
router.get('/', getActivePackages);
router.post('/subscribe', verifyToken as any, subscribeToPackage as any);

// Admin APIs
router.post('/admin', verifyToken as any, authorizeRole(['admin']) as any, createPackage as any);
router.put('/admin/:id', verifyToken as any, authorizeRole(['admin']) as any, updatePackage as any);
router.delete('/admin/:id', verifyToken as any, authorizeRole(['admin']) as any, deletePackage as any);
router.get('/admin', verifyToken as any, authorizeRole(['admin']) as any, getAllPackagesAdmin as any);

module.exports = router;
