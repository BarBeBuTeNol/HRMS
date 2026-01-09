import express from "express";
import { getDashboardStats } from "../controllers/chroController";

const router = express.Router();

router.get("/stats", getDashboardStats);

export default router;
