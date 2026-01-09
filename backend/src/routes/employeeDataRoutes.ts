import { Router } from "express";
import { savePersonalData, saveJobData, saveEducationData, getGenders } from "../controllers/employeeDataController";

const router = Router();

// Endpoint for each step
router.post("/personal", savePersonalData);
router.post("/job", saveJobData);
router.post("/education", saveEducationData);
router.get("/genders", getGenders);

export default router;
