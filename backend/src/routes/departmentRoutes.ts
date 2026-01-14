import { Router } from "express";
import { getAllDepartments } from "../controllers/departmentController";

const router = Router();

// GET /api/departments
router.get("/", getAllDepartments);

import { createDepartment } from "../controllers/departmentController";
// POST /api/departments
// req: { department_name: string }
router.post("/", createDepartment);

export default router;
