import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  savePersonalData,
  saveJobData,
  saveEducationData,
  getGenders,
} from "../controllers/employeeDataController";

const router = Router();

// Configure Multer for profile images
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/avatars/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Configure Multer for attachments
const attachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/attachments/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "attachment-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadAttachments = multer({
  storage: attachmentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".docx", ".jpg", ".jpeg"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOCX, JPG allowed."));
    }
  },
});

// Endpoint for each step
router.post("/personal", uploadAvatar.single("image"), savePersonalData);
router.post(
  "/job",
  uploadAttachments.fields([
    { name: "performanceFiles", maxCount: 5 },
    { name: "trainingFiles", maxCount: 5 },
  ]),
  saveJobData,
);
router.post(
  "/education",
  uploadAttachments.array("educationFiles", 5),
  saveEducationData,
);
router.get("/genders", getGenders);

export default router;
