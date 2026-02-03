import { Router } from "express";
import { getAllDepartments } from "../controllers/departmentController";

const router = Router();

// GET /api/departments
router.get("/", getAllDepartments);

import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController";
// POST /api/departments
// req: { department_name: string }
router.post("/", createDepartment);

// PUT /api/departments/:id
router.put("/:id", updateDepartment);

// DELETE /api/departments/:id
router.delete("/:id", deleteDepartment);

export default router;
