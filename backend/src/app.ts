import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db"; 
import userRoutes from "./routes/userRoutes"; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// test db
app.get("/api/health", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS result");
    res.json({ db: "connected", result: rows[0].result });
  } catch (err: any) {
    res.status(500).json({ db: "error", message: err.message });
  }
});

// ✅ เพิ่ม route ของ users
app.use("/api/users", userRoutes);

app.listen(5000, () => console.log("✅ Backend running at http://localhost:5000"));
