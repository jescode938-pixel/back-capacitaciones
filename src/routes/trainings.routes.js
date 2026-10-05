import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  listTrainings, getTraining, createTraining,
  updateTraining, deleteTraining, registerView
} from '../controllers/trainings.controller.js';

const router = Router();

// Limitar vistas para que nadie sature el contador
const viewLimiter = rateLimit({ windowMs: 60_000, max: 30 });

// Públicas
router.get('/', listTrainings);
router.get('/:id', getTraining);
router.post('/:id/view', viewLimiter, registerView);

// Solo admin
router.post('/', verifyToken, verifyAdmin, upload.single('file'), createTraining);
router.put('/:id', verifyToken, verifyAdmin, updateTraining);
router.delete('/:id', verifyToken, verifyAdmin, deleteTraining);

export default router;