import { Router } from 'express';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { getStats } from '../controllers/admin.controller.js';

const router = Router();
router.get('/stats', verifyToken, verifyAdmin, getStats);
export default router;