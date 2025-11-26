import express from "express";
import db from "../../src/config/db";
import { ResultSetHeader } from "mysql2";

const router = express.Router();

// ✅ ดึงข้อมูลทั้งหมด (JOIN users + department)
// ✅ GET: ดึงข้อมูลทั้งหมดพร้อมชื่อพนักงานและแผนก
router.get("/", async (req, res) => {
  try {
    const sql = `
      SELECT 
        ws.id,
        ws.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS employee_name,
        COALESCE(d.department_name, 'ไม่ระบุแผนก') AS department_name,
        ws.date,
        ws.shift
      FROM work_schedules ws
      JOIN users u ON ws.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      ORDER BY ws.date ASC
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("❌ Get schedules error:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});


// ✅ เพิ่มหรืออัปเดตหลายรายการ (bulk-upsert)
router.post("/bulk-upsert", async (req, res) => {
  try {
    const schedules = req.body;

    if (!Array.isArray(schedules) || schedules.length === 0) {
      return res.status(400).json({ error: "Schedules must be a non-empty array" });
    }

    console.log("📦 Received schedules:", schedules);

    const sql = `
      INSERT INTO work_schedules (user_id, date, shift, created_at, updated_at)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        shift = VALUES(shift),
        updated_at = NOW()
    `;

    const values = schedules.map((s) => [
      s.user_id,
      s.date,
      s.shift,
      new Date(),
      new Date(),
    ]);

    await db.query(sql, [values]);
    res.status(200).json({ message: "✅ Bulk upsert completed" });
  } catch (err) {
    console.error("❌ Bulk upsert error:", err);
    res.status(500).json({ error: "Failed to bulk upsert schedules" });
  }
});

// ✅ ลบตามวันที่
router.delete("/date/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM work_schedules WHERE date = ?",
      [date]
    );

    res.status(200).json({ message: `✅ Deleted schedules on ${date}`, deleted: result.affectedRows });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ error: "Failed to delete schedules" });
  }
});

// ✅ ลบทั้งหมด
router.delete("/", async (req, res) => {
  try {
    await db.query("DELETE FROM work_schedules");
    res.status(200).json({ message: "✅ All schedules cleared" });
  } catch (err) {
    console.error("❌ Clear all error:", err);
    res.status(500).json({ error: "Failed to clear schedules" });
  }
});

export default router;
