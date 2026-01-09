import express from "express";
import { getSwapList, getSwapStats, verifySwap } from "../controllers/SwapReportController";

const router = express.Router();

// Get list of swaps with details
router.get("/swaps", getSwapList);

// Get statistics for dashboard
router.get("/swaps/stats", getSwapStats);

// Verify/Acknowledge a swap
router.post("/swaps/:id/verify", verifySwap);

export default router;
