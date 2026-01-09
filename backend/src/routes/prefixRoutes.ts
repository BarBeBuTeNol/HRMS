import { Router } from "express";
import { getAllPrefixes } from "../controllers/prefixController";

const router = Router();

// GET /api/prefixes
router.get("/", getAllPrefixes);

export default router;
