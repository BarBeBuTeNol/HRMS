import express from "express";
import cors from "cors";
import dotenv from "dotenv";

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
console.log("DEBUG shiftAssignmentRoutes >>>", shiftAssignmentRoutes);

dotenv.config();

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000"
    ],
    credentials: true,
  })
);
app.use(express.json());

// ✅ test endpoint
app.get("/", (_req, res) => res.json({ message: "Backend is running 🚀" }));

// ✅ mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);      // จัดการ users
app.use("/api/users", profileRoutes);   // จัดการ profile ของ user
app.use("/api/leave-requests", leaveRoutes); // ✅ ปรับให้เฉพาะ leave
app.use("/api/notifications", notificationRoutes); // ✅ สำหรับแจ้งเตือน
app.use("/api/leave-history", leaveHistoryRoutes); // ✅ สำหรับประวัติการลา
app.use("/api/employees", employeeRoutes); // ✅ สำหรับดึงพนักงานในแผนก
app.use("/api/work-schedules", workScheduleRoutes); // ✅ สำหรับจัดการตารางเวร
app.use("/api", taskAssignmentRoutes); // ✅ สำหรับจัดการมอบหมายงาน
app.use("/api", shiftAssignmentRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/job-positions", jobPositionRoutes);
app.use("/api/employee-data", employeeDataRoutes);
app.use("/api/prefixes", prefixRoutes);

// ✅ Reports Routes
import swapReportRoutes from "./routes/swapReportRoutes";
app.use("/api/reports", swapReportRoutes);

import announcementRoutes from "./routes/announcementRoutes";
app.use("/api/announcements", announcementRoutes);

import chroRoutes from "./routes/chroRoutes";
app.use("/api/chro", chroRoutes);

// ✅ Log Routes
import logRoutes from "./routes/logRoutes";
app.use("/api/logs", logRoutes);

// ✅ Change Request Routes
import changeRequestRoutes from "./routes/changeRequestRoutes";
app.use("/uploads", express.static("uploads")); // Serve uploaded files
app.use("/api/change-requests", changeRequestRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
