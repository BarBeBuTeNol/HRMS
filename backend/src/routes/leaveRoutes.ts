import { Router } from "express";
import pool from "../config/db";
import { ResultSetHeader } from "mysql2";

const router = Router();

// POST: ส่งคำขอลา (Employee)
router.post("/", async (req, res) => {
  console.log("📥 POST /leave-requests Body:", req.body);
  try {
    const { user_id, leave_type, start_date, end_date, reason, status } = req.body;

    // Determine initial status (default to 'pending')
    const initialStatus = (status === 'approved' || status === 'Approved') ? 'approved' : 'pending';

    // 1) insert leave request
    console.log(`➡️ Inserting leave request with status: ${initialStatus}...`);
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, leave_type, start_date, end_date, reason, initialStatus],
    );
    console.log("✅ Leave request inserted. ID:", (result as any).insertId);

    // 2) ดึงข้อมูลพนักงานหรกำ
    console.log("➡️ Fetching employee info for user_id:", user_id);
    const [[emp]]: any = await pool.query(
      `SELECT u.first_name, u.last_name, u.department_id
       FROM users u
       WHERE u.id = ?`,
      [user_id],
    );

    if (emp) {
      console.log("✅ Employee found:", emp.first_name, "Dept:", emp.department_id);
      
      // 3) หา head ของแผนก
      console.log("➡️ Finding Head of Dept:", emp.department_id);
      const [[head]]: any = await pool.query(
        `SELECT u.id, u.first_name, u.last_name
         FROM users u
         WHERE u.department_id = ? AND u.role_id = 4
         LIMIT 1`,
        [emp.department_id],
      );

      if (head) {
        console.log("✅ Head found:", head.id);
        // 4) แจ้งเตือนหัวหน้า
        const message = `${emp.first_name} ${emp.last_name} ขอ "${leave_type}" ${start_date} ถึง ${end_date}`;
        console.log("➡️ Inserting notification for head...");
        
        try {
            await pool.query(
              `INSERT INTO notifications (user_id, message, type, is_read, created_at)
               VALUES (?, ?, 'system', 0, NOW())`,
              [head.id, message],
            );
            console.log("✅ Notification sent to Head:", head.id);
        } catch (notifErr: any) {
            console.error("⚠️ Failed to send notification (non-fatal):", notifErr.message);
        }
      } else {
        console.log("⚠️ ไม่มีหัวหน้าใน department:", emp.department_id);
      }
    } else {
        console.warn("⚠️ Employee not found for user_id:", user_id);
    }

    res.json({
      success: true,
      message: "บันทึกการลาสำเร็จ และแจ้งเตือนหัวหน้าแล้ว",
      insertId: (result as any).insertId,
    });
  } catch (error: any) {
    console.error("❌ Error in POST /leave-requests FULL ERROR:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        error: error.message,
        sqlMessage: error.sqlMessage, // Return SQL error if available
        stack: error.stack // useful for us to see where it failed if user shows response
      });
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
       ORDER BY lr.created_at DESC`,
    );
    res.json(rows);
  } catch (error: any) {
    console.error("❌ Error in GET /leave-requests/all:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// GET: Fetch all leave types (For dropdowns)
router.get("/types", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM leave_types ORDER BY id ASC");
    res.json(rows);
  } catch (error: any) {
    console.error("❌ Error in GET /leave-requests/types:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// GET: Summary of leave usage for a user (Personal Quota)
router.get("/summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Get Quotas from DB
    const [leaveTypes]: any = await pool.query("SELECT name, default_quota, label_en FROM leave_types");
    const quotas: Record<string, number> = {};
    leaveTypes.forEach((lt: any) => {
        quotas[lt.name] = lt.default_quota;
    });

    // 2. Calculate sum of days used per leave type for current year
    const [usageRows]: any = await pool.query(
        `SELECT leave_type, 
                SUM(DATEDIFF(end_date, start_date) + 1) as used_days
         FROM leave_requests
         WHERE user_id = ? 
           AND status = 'approved'
           AND YEAR(start_date) = YEAR(CURDATE())
         GROUP BY leave_type`,
        [userId],
      );

    // Format result
    const summary = leaveTypes.map((lt: any) => {
      const type = lt.name;
      const found: any = usageRows.find(
        (r: any) => r.leave_type === type,
      );
      return {
        type,
        label: lt.label_en,
        used: found ? parseInt(found.used_days) : 0,
        limit: lt.default_quota,
      };
    });

    res.json(summary);
  } catch (error: any) {
    console.error("❌ Error in GET /leave-requests/summary/:userId:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
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
      [userId],
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
      [headId],
    );

    if (!head) return res.status(404).json({ message: "ไม่พบหัวหน้า" });

    // ดึงคำขอลา (pending) ของพนักงานในแผนกเดียวกัน
    // พร้อมข้อมูลพนักงาน + Conflict Check
    const [rows]: any = await pool.query(
      `SELECT lr.id, lr.leave_type AS leaveType, lr.start_date AS startDate, lr.end_date AS endDate,
              lr.reason, lr.status, lr.created_at,
              u.first_name AS employeeName, u.last_name, 
              ei.emp_code, jp.position_name,
              
              (SELECT COUNT(*) 
               FROM leave_requests lr2
               JOIN users u2 ON lr2.user_id = u2.id
               WHERE u2.department_id = u.department_id
                 AND lr2.status = 'approved'
                 AND lr2.start_date <= lr.end_date
                 AND lr2.end_date >= lr.start_date
                 AND lr2.user_id != lr.user_id
              ) as conflictCount

       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.id
       JOIN departments d ON u.department_id = d.id
       LEFT JOIN emp_info ei ON u.id = ei.user_id 
            AND ei.id = (SELECT MAX(id) FROM emp_info WHERE user_id = u.id)
       LEFT JOIN job_positions jp ON ei.position_id = jp.id
       
       WHERE u.department_id = ? AND lr.status = 'pending'
       ORDER BY lr.created_at DESC`,
      [head.department_id],
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
    const { status, rejection_reason } = req.body; // "approved" หรือ "rejected"

    let query = `UPDATE leave_requests SET status = ?`;
    let params = [status] as any[];

    if (rejection_reason !== undefined) {
      query += `, rejection_reason = ?`;
      params.push(rejection_reason);
    }

    query += ` WHERE id = ?`;
    params.push(id);

    await pool.query(query, params);

    // Notify Employee
    const [[leaveReq]]: any = await pool.query(
      "SELECT user_id, leave_type FROM leave_requests WHERE id = ?",
      [id],
    );
    if (leaveReq) {
      const message = `คำขอลา "${leaveReq.leave_type}" ของคุณถูก ${status === "approved" ? "อนุมัติ ✅" : "ปฏิเสธ ❌"}`;
      await pool.query(
        "INSERT INTO notifications (user_id, message, type, is_read, created_at) VALUES (?, ?, 'system', 0, NOW())",
        [leaveReq.user_id, message],
      );
    }

    res.json({ success: true, message: `อัปเดตคำขอลาเป็น ${status}` });
  } catch (error: any) {
    console.error("❌ Error in PUT /leave-requests/:id/status:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
  }
});
// GET: สถิติการลาในแผนก แยกตามเดือน
// GET: สถิติการลาสำหรับ Dashboard (Leave Analytics)
router.get("/stats/analytics/:headId", async (req, res) => {
  try {
    const { headId } = req.params;

    // 1. Get Head's Department
    const [[head]]: any = await pool.query(
      `SELECT department_id FROM users WHERE id = ? AND role_id = 4`,
      [headId],
    );

    if (!head) return res.status(404).json({ message: "Head not found" });

    // 2. Get All Employees in Department
    const [employees]: any = await pool.query(
      `SELECT id, first_name, last_name, email
       FROM users 
       WHERE department_id = ?`,
      [head.department_id],
    );

    // 3. Get Approved Leaves for Department
    const [leaves]: any = await pool.query(
      `SELECT lr.user_id, lr.leave_type, lr.start_date, lr.end_date
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.id
       WHERE u.department_id = ? AND lr.status = 'approved'`,
      [head.department_id],
    );

    // 4. Get Holidays
    let holidays: any[] = [];
    try {
      const [holidayRows]: any = await pool.query(
        `SELECT start_date, end_date FROM holiday_calendar`,
      );
      holidays = holidayRows;
    } catch (err) {
      console.warn("Could not fetch holiday_calendar", err);
    }

    // --- Helper to calculate business days (excluding holidays) ---
    const calculateLeaveDays = (start: string | Date, end: string | Date) => {
      let startDate = new Date(start);
      let endDate = new Date(end);
      let count = 0;
      let curDate = new Date(startDate);

      while (curDate <= endDate) {
        // Check if holiday
        const isHoliday = holidays.some((h: any) => {
          const hStart = new Date(h.start_date);
          const hEnd = new Date(h.end_date);
          return curDate >= hStart && curDate <= hEnd;
        });

        if (!isHoliday) {
          count++;
        }
        curDate.setDate(curDate.getDate() + 1);
      }
      return count;
    };

    // --- Process Data ---

    let totalLeaveDays = 0;
    const leaveTypeCount: Record<string, number> = {};
    const monthlyTrend: Record<string, number> = {};
    const userLeaveSummary: Record<number, number> = {};

    employees.forEach((emp: any) => {
      userLeaveSummary[emp.id] = 0;
    });

    leaves.forEach((leave: any) => {
      const days = calculateLeaveDays(leave.start_date, leave.end_date);

      totalLeaveDays += days;

      // Leave Type Distribution (Count of Requests)
      leaveTypeCount[leave.leave_type] =
        (leaveTypeCount[leave.leave_type] || 0) + 1;

      // Monthly Trend (Sum of Days)
      const monthKey = new Date(leave.start_date).toLocaleString("default", {
        month: "short",
      });
      monthlyTrend[monthKey] = (monthlyTrend[monthKey] || 0) + days;

      if (userLeaveSummary[leave.user_id] !== undefined) {
        userLeaveSummary[leave.user_id] += days;
      }
    });

    // 1. Attendance Rate (This Month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const totalEmployees = employees.length;
    const workingDaysInMonth = 22;
    const totalPossibleDays = totalEmployees * workingDaysInMonth;

    let thisMonthLeaveDays = 0;
    leaves.forEach((leave: any) => {
      const s = new Date(leave.start_date);
      if (s.getMonth() === currentMonth && s.getFullYear() === currentYear) {
        thisMonthLeaveDays += calculateLeaveDays(
          leave.start_date,
          leave.end_date,
        );
      }
    });

    const attendanceRate =
      totalPossibleDays > 0
        ? ((totalPossibleDays - thisMonthLeaveDays) / totalPossibleDays) * 100
        : 100;

    // 2. Pie Chart Data
    const pieData = Object.keys(leaveTypeCount).map((key) => ({
      name: key,
      value: leaveTypeCount[key],
    }));

    // 3. Line Chart Data
    const monthsOrder = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const lineData = monthsOrder.map((m) => ({
      name: m,
      days: monthlyTrend[m] || 0,
    }));

    // 4. Employee Stats
    const employeeStats = employees.map((emp: any) => {
      const used = userLeaveSummary[emp.id] || 0;
      return {
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        department: head.department_id,
        usedDays: used,
        quota: 30,
        attendance: Math.max(0, 100 - (used / 260) * 100).toFixed(1),
      };
    });

    const topAbsentees = [...employeeStats]
      .sort((a, b) => b.usedDays - a.usedDays)
      .slice(0, 5);

    res.json({
      attendanceRate: parseFloat(attendanceRate.toFixed(1)),
      pieData,
      lineData,
      topAbsentees,
      employeeStats,
    });
  } catch (error: any) {
    console.error("❌ Error in GET /stats/analytics:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

export default router;
