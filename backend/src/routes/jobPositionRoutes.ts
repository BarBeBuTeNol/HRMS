import { Router } from "express";
import { getJobPositions } from "../controllers/jobPositionController";

const router = Router();

// GET /api/job-positions
router.get("/", getJobPositions);

export default router;
