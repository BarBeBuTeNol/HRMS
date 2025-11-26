// routes/taskAssignmentRoutes.ts
import express from "express";
import pool from "../config/db";
import { ResultSetHeader } from "mysql2";

const router = express.Router();

// เพิ่มงานใหม่
router.post("/task_assignments", async (req, res) => {
  try {
    const { user_id, task_name, description, deadline } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO task_assignments 
       (user_id, task_name, description, deadline, progress, created_at, updated_at) 
       VALUES (?, ?, ?, ?, 0, NOW(), NOW())`,
      [user_id, task_name, description, deadline]
    );

    // ✅ ตอนนี้ TypeScript รู้แล้วว่า result เป็น ResultSetHeader
    res.json({ success: true, taskId: result.insertId });
  } catch (err: any) {
    console.error("❌ Error adding task:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
// routes/taskAssignmentRoutes.ts
router.get("/users/:id/task_assignments", async (req, res) => {
  try {
    const userId = req.params.id;
    const [rows] = await pool.query(
      `SELECT id, task_name, description, deadline, progress, status, created_at, updated_at
       FROM task_assignments
       WHERE user_id = ?`,
      [userId]
    );

    res.json(rows);
  } catch (err: any) {
    console.error("❌ Error fetching tasks:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch("/task_assignments/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { progress, status } = req.body;

    // ตรวจสอบค่า progress
    if (progress < 0 || progress > 100) {
      return res.status(400).json({ success: false, message: "progress ต้องอยู่ระหว่าง 0-100" });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE task_assignments 
       SET progress = ?, status = ?, updated_at = NOW() 
       WHERE id = ?`,
      [progress, status || "กำลังทำ", taskId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "ไม่พบงานนี้" });
    }

    res.json({ success: true, message: "อัปเดตงานเรียบร้อยแล้ว" });
  } catch (err: any) {
    console.error("❌ Error updating task:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});


export default router;
