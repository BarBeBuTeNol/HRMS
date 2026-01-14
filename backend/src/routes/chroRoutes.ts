import express from 'express';
import chroController from '../controllers/chroController';

const router = express.Router();

router.get('/stats', chroController.getDashboardStats);
router.get('/approvals', chroController.getApprovals);
router.post('/leave/action', chroController.handleLeaveAction);
router.post('/delegation/action', chroController.handleDelegationAction);
router.post('/read', chroController.handleMarkAsRead);

export default router;
