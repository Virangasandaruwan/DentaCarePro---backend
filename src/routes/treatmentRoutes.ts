import express from 'express';
import { getTreatments, createTreatment } from '../controllers/treatmentController';
import { protect } from '../middleware/authMiddleware';
const router = express.Router();
router.get('/', protect, getTreatments);
router.post('/', protect, createTreatment);
export default router;
