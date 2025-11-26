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
console.log("DEBUG shiftAssignmentRoutes >>>", shiftAssignmentRoutes);

dotenv.config();

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
