import express from 'express';
import TeamPerformanceController from '../controllers/TeamPerformanceController';

const router = express.Router();

router.get('/overview/:headId', TeamPerformanceController.getOverview);
router.get('/members/:headId', TeamPerformanceController.getMembersPerformance);

export default router;
