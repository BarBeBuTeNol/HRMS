import express from "express";
import pool from "../config/db";
import { ResultSetHeader } from "mysql2";

const router = express.Router();

// 👉 เพิ่มการมอบหมายเวร
router.post("/shift_assignments", async (req, res) => {
  try {
    const { leave_emp_id, delegate_emp_id, shift_date, shift_type, note, created_by } = req.body;

    if (!leave_emp_id || !delegate_emp_id || !shift_date || !shift_type) {
      return res.status(400).json({ success: false, message: "กรอกข้อมูลไม่ครบ" });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO shift_assignments 
       (leave_emp_id, delegate_emp_id, shift_date, shift_type, note, created_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [leave_emp_id, delegate_emp_id, shift_date, shift_type, note || null, created_by]
    );

    res.json({ success: true, assignmentId: result.insertId });
  } catch (err: any) {
    console.error("❌ Error adding shift assignment:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 👉 ดึงรายการการมอบหมายเวร (ทั้งหมดหรือของพนักงาน)
router.get("/shift_assignments", async (req, res) => {
  try {
    const { empId } = req.query;
    let sql = `
  SELECT sa.id, sa.shift_date, sa.shift_type, sa.note, sa.created_at,
         CONCAT(u1.first_name, ' ', u1.last_name) AS leave_emp_name,
         CONCAT(u2.first_name, ' ', u2.last_name) AS delegate_emp_name,
         CONCAT(u3.first_name, ' ', u3.last_name) AS created_by_name
  FROM shift_assignments sa
  JOIN users u1 ON sa.leave_emp_id = u1.id
  JOIN users u2 ON sa.delegate_emp_id = u2.id
  JOIN users u3 ON sa.created_by = u3.id
`;


    const params: any[] = [];

    if (empId) {
      sql += " WHERE sa.leave_emp_id = ? OR sa.delegate_emp_id = ?";
      params.push(empId, empId);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err: any) {
    console.error("❌ Error fetching shift assignments:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 👉 ลบการมอบหมายเวร
router.delete("/shift_assignments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM shift_assignments WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "ไม่พบข้อมูล" });
    }

    res.json({ success: true, message: "ลบข้อมูลเรียบร้อยแล้ว" });
  } catch (err: any) {
    console.error("❌ Error deleting shift assignment:", err);
    res.status(500).json({ success: false, message: err.message });
  }
})
export default router;