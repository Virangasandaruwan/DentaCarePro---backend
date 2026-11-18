import express from 'express';
import { getAppointments, createAppointment, updateAppointment } from '../controllers/appointmentController';
import { protect } from '../middleware/authMiddleware';
const router = express.Router();
router.get('/', protect, getAppointments);
router.post('/', protect, createAppointment);
router.put('/:id', protect, updateAppointment);
export default router;
