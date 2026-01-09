import { Router } from "express";
import { getAllDepartments } from "../controllers/departmentController";

const router = Router();

// GET /api/departments
router.get("/", getAllDepartments);

export default router;
