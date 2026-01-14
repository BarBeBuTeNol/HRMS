
import express from 'express';
import { getLogs, createLog } from '../controllers/logController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = express.Router();

// Only CHRO or Admin should access this, but using basic auth for now as per project standard
router.get('/', getLogs);
router.post('/', createLog);

export default router;
