import { Router } from "express";
import pool from "../config/db";
import { ResultSetHeader } from "mysql2";

const router = Router();

// POST: ส่งคำขอลา (Employee)
router.post("/", async (req, res) => {
  try {
    const { user_id, leave_type, start_date, end_date, reason } = req.body;

    // 1) insert leave request
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [user_id, leave_type, start_date, end_date, reason]
    );

    // 2) ดึงข้อมูลพนักงานหรกำ
    const [[emp]]: any = await pool.query(
      `SELECT u.first_name, u.last_name, u.department_id
       FROM users u
       WHERE u.id = ?`,
      [user_id]
    );

    if (emp) {
      // 3) หา head ของแผนก
      const [[head]]: any = await pool.query(
        `SELECT u.id, u.first_name, u.last_name
         FROM users u
         WHERE u.department_id = ? AND u.role_id = 4
         LIMIT 1`,
        [emp.department_id]
      );

      if (head) {
        // 4) แจ้งเตือนหัวหน้า
        const message = `${emp.first_name} ${emp.last_name} ขอ "${leave_type}" ${start_date} ถึง ${end_date}`;
        await pool.query(
          `INSERT INTO notifications (user_id, message)
           VALUES (?, ?)`,
          [head.id, message]
        );
        console.log("✅ Notification sent to Head:", head.id);
      } else {
        console.log("⚠️ ไม่มีหัวหน้าใน department:", emp.department_id);
      }
    }

    res.json({
      success: true,
      message: "บันทึกการลาสำเร็จ และแจ้งเตือนหัวหน้าแล้ว",
      insertId: (result as any).insertId,
    });
  } catch (error: any) {
    console.error("❌ Error in POST /leave-requests:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error: error.message });
  }
});


// GET: Fetch ALL leave requests (For HR)
router.get("/all", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT lr.id, lr.leave_type, lr.start_date, lr.end_date, lr.status, lr.reason, lr.created_at,
              u.first_name, u.last_name
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.id
       ORDER BY lr.created_at DESC`
    );
    res.json(rows);
  } catch (error: any) {
    console.error("❌ Error in GET /leave-requests/all:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// GET: ประวัติการลาตาม user_id
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      `SELECT id, leave_type, start_date, end_date, status, reason, created_at
       FROM leave_requests
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ Error in GET /leave-requests/:userId:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

router.get("/for-head/:headId", async (req, res) => {
  try {
    const { headId } = req.params;

    // หา department ของหัวหน้า
    const [[head]]: any = await pool.query(
      `SELECT department_id FROM users WHERE id = ? AND role_id = 4`,
      [headId]
    );

    if (!head) return res.status(404).json({ message: "ไม่พบหัวหน้า" });

    // ดึงคำขอลา (pending) ของพนักงานในแผนกเดียวกัน
    const [rows]: any = await pool.query(
      `SELECT lr.id, lr.leave_type AS leaveType, lr.start_date AS startDate, lr.end_date AS endDate,
              lr.reason, lr.status,
              u.first_name AS employeeName, d.department_name AS department
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.id
       JOIN departments d ON u.department_id = d.id
       WHERE u.department_id = ? AND lr.status = 'pending'
       ORDER BY lr.created_at DESC`,
      [head.department_id]
    );

    res.json(rows);
  } catch (error: any) {
    console.error("❌ Error in GET /leave-requests/for-head/:headId:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
  }
});

// PUT: อัปเดตสถานะการลา (approve / reject)
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "approved" หรือ "rejected"

    await pool.query(
      `UPDATE leave_requests SET status = ? WHERE id = ?`,
      [status, id]
    );

    res.json({ success: true, message: `อัปเดตคำขอลาเป็น ${status}` });
  } catch (error: any) {
    console.error("❌ Error in PUT /leave-requests/:id/status:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
  }
});
// GET: สถิติการลาในแผนก แยกตามเดือน
router.get("/stats/department/:headId", async (req, res) => {
  try {
    const { headId } = req.params;

    // 1) หา department ของหัวหน้า
    const [[head]]: any = await pool.query(
      `SELECT department_id FROM users WHERE id = ? AND role_id = 4`,
      [headId]
    );
    if (!head) return res.status(404).json({ message: "ไม่พบหัวหน้า" });

    // 2) ดึงสถิติแยกตามประเภทการลา (pie chart)
    const [pieData]: any = await pool.query(
      `SELECT DATE_FORMAT(start_date, '%Y-%m') as month,
              leave_type, COUNT(*) as value
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.id
       WHERE u.department_id = ?
       GROUP BY month, leave_type
       ORDER BY month DESC`,
      [head.department_id]
    );

    // 3) ดึงสถิติแยกตามพนักงาน (bar chart)
    const [barData]: any = await pool.query(
      `SELECT DATE_FORMAT(lr.start_date, '%Y-%m') as month,
              CONCAT(u.first_name, ' ', u.last_name) as name,
              COUNT(*) as leaveCount
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.id
       WHERE u.department_id = ?
       GROUP BY month, u.id
       ORDER BY month DESC`,
      [head.department_id]
    );

    res.json({ pieData, barData });
  } catch (error: any) {
    console.error("❌ Error in GET /leave-requests/stats/department:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
  }
});


export default router;
