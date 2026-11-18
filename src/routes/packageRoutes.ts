import express from 'express';
import { getPackages, createPackage, deletePackage } from '../controllers/packageController';
import { protect } from '../middleware/authMiddleware';
const router = express.Router();
router.get('/', getPackages);
router.post('/', protect, createPackage);
router.delete('/:id', protect, deletePackage);
export default router;
