import { Router } from "express";
import pool from "../config/db";

const router = Router();

// GET: ประวัติการลาของพนักงานในแผนก
router.get("/department/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [[user]]: any = await pool.query(
      `SELECT department_id FROM users WHERE id = ?`,
      [userId]
    );

    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });

   const [rows]: any = await pool.query(
  `SELECT lr.id,
       lr.leave_type AS leaveType,
       lr.start_date AS startDate,
       lr.end_date AS endDate,
       lr.reason,
       lr.status,
lr.updated_at AS updatedAt,
lr.created_at AS createdAt,

       u.id AS employeeId,   -- ✅ เพิ่มรหัสพนักงาน
       CONCAT(u.first_name, ' ', u.last_name) AS employeeName,
       r.role_name AS position,
       d.department_name AS department
FROM leave_requests lr
JOIN users u ON lr.user_id = u.id
JOIN departments d ON u.department_id = d.id
JOIN roles r ON u.role_id = r.id
WHERE u.department_id = ?
ORDER BY lr.created_at DESC
`,
  [user.department_id]
);


    res.json(rows);
  } catch (error: any) {
    console.error("❌ Error in /leave-history/department/:userId:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
  }
});

export default router;
