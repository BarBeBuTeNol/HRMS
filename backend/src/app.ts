import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db";
import { RowDataPacket } from "mysql2";
import userRoutes from "./routes/userRoutes";
import roleRoutes from "./routes/roleRoutes";
import chroRoutes from "./routes/chroRoutes";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: [
      "https://hrms-frontend.ghostkk10.workers.dev",
      "http://localhost:5173",
    ], // ใส่ทั้ง URL จริง และ URL ตอนเทสในเครื่อง
    credentials: true,
  }),
);
app.use(express.json());

// test db
app.get("/api/health", async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT 1 AS result");
    res.json({ db: "connected", result: rows[0].result });
  } catch (err: any) {
    res.status(500).json({ db: "error", message: err.message });
  }
});

// ✅ เพิ่ม route ของ users
app.use("/api/users", userRoutes);
console.log("Registering role routes...");
app.use("/api/roles", roleRoutes);

// ✅ CHRO Routes
app.use("/api/chro", chroRoutes);

// ✅ Log Routes
import logRoutes from "./routes/logRoutes";
app.use("/api/logs", logRoutes);
app.get("/api/debug", (req, res) => res.json({ message: "Server is running" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
