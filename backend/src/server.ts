import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { RowDataPacket } from "mysql2";
import pool from "./config/db"; // ตรวจสอบว่าไฟล์ config/db.ts ตั้งค่าเชื่อมต่อ Aiven ถูกต้อง

// Import Routes ทั้งหมด
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import profileRoutes from "./routes/profileRoutes";
import leaveRoutes from "./routes/leaveRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import leaveHistoryRoutes from "./routes/leaveHistoryRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import workScheduleRoutes from "./routes/workScheduleRoutes";
import taskAssignmentRoutes from "./routes/taskAssignmentRoutes";
import shiftAssignmentRoutes from "./routes/shiftAssignmentRoutes";
import roleRoutes from "./routes/roleRoutes";
import departmentRoutes from "./routes/departmentRoutes";
import employeeDataRoutes from "./routes/employeeDataRoutes";
import prefixRoutes from "./routes/prefixRoutes";
import jobPositionRoutes from "./routes/jobPositionRoutes";
import swapReportRoutes from "./routes/swapReportRoutes";
import announcementRoutes from "./routes/announcementRoutes";
import chroRoutes from "./routes/chroRoutes";
import headRoutes from "./routes/headRoutes";
import logRoutes from "./routes/logRoutes";
import changeRequestRoutes from "./routes/changeRequestRoutes";
import calendarRoutes from "./routes/calendarRoutes";
import taskReplacementRoutes from "./routes/taskReplacementRoutes";

dotenv.config();

const app = express();

// ✅ 1. ตั้งค่า CORS ให้รองรับทั้งการเทสในเครื่องและหน้าเว็บจริง
app.use(
  cors({
    origin: [
      "https://hrms-frontend.ghostkk10.workers.dev", // URL ของ Cloudflare (ต้องตรงเป๊ะ 100% ไม่งั้นจะขึ้น CORS Error)
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use("/uploads", express.static("uploads")); // สำหรับดึงรูปภาพหรือไฟล์ที่อัปโหลด

// ✅ 2. Health Check Endpoint (สำหรับตรวจสอบสถานะฐานข้อมูล Aiven)
app.get("/api/health", async (_req, res) => {
  try {
    // ทดสอบดึงข้อมูลจาก pool ที่เชื่อมต่อกับฐานข้อมูล hrms บน Aiven
    const [rows] = await pool.query<RowDataPacket[]>("SELECT 1 AS result");
    res.json({
      status: "online",
      db: "connected",
      result: rows[0].result,
    });
  } catch (err: any) {
    res.status(500).json({
      status: "down",
      db: "error",
      message: err.message,
    });
  }
});

// ✅ 3. Base Route
app.get("/", (_req, res) =>
  res.json({ message: "HRMS Backend is running 🚀" }),
);

// ✅ 4. Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users", profileRoutes);
app.use("/api/leave-requests", leaveRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/leave-history", leaveHistoryRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/work-schedules", workScheduleRoutes);
app.use("/api", taskAssignmentRoutes);
app.use("/api", shiftAssignmentRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/job-positions", jobPositionRoutes);
app.use("/api/employee-data", employeeDataRoutes);
app.use("/api/prefixes", prefixRoutes);
app.use("/api/reports", swapReportRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/chro", chroRoutes);
app.use("/api/head", headRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/change-requests", changeRequestRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/replacements", taskReplacementRoutes);

// ✅ 5. Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
  console.log(`🚀 Health Check: http://localhost:${PORT}/api/health`);
});
