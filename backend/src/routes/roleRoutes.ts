import { Router } from "express";
import { getAllRoles } from "../controllers/roleController";

const router = Router();

// GET /api/roles
router.get("/", getAllRoles);

export default router;
