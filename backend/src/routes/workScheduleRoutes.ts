import express from "express";
import db from "../config/db"; // ✅ แก้ไข Path ให้ถูกต้อง (ตัด ../ และ src/ ออก)
import { ResultSetHeader } from "mysql2";
import { getMySchedules } from "../controllers/workScheduleController";
import notificationRepository from "../repository/notificationRepository";

const router = express.Router();

// ✅ Get schedules for conflict checking (Use Controller)
router.get("/my-schedules", getMySchedules);

// Helper to map DB Shift to Frontend Shift
const mapToFrontendShift = (dbShift: string) => {
  switch (dbShift) {
    case "Morning":
      return "M";
    case "Afternoon":
      return "A";
    case "Night":
      return "N";
    case "Full-day":
      return "F";
    default:
      return dbShift;
  }
};

// Helper to map Frontend Shift to DB Shift
const mapToDbShift = (feShift: string) => {
  switch (feShift) {
    case "M":
      return "Morning";
    case "A":
      return "Afternoon";
    case "N":
      return "Night";
    case "F":
      return "Full-day";
    default:
      return feShift;
  }
};

// ✅ ดึงข้อมูลทั้งหมด (JOIN users + department)
router.get("/", async (req, res) => {
  try {
    const sql = `
      SELECT 
        ws.id,
        ws.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS employee_name,
        COALESCE(d.department_name, 'ไม่ระบุแผนก') AS department_name,
        ws.work_date AS date,
        ws.shift
      FROM work_schedules ws
      JOIN users u ON ws.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      ORDER BY ws.work_date ASC
    `;
    const [rows]: any = await db.query(sql);
    const mappedRows = rows.map((r: any) => ({
      ...r,
      shift: mapToFrontendShift(r.shift),
    }));
    res.json(mappedRows);
  } catch (err) {
    console.error("❌ Get schedules error:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

// ✅ GET: ดึงตารางงานของพนักงานคนเดียว
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const sql = `
        SELECT 
          ws.id,
          ws.user_id,
          ws.work_date AS date,
          ws.shift
        FROM work_schedules ws
        WHERE ws.user_id = ?
        ORDER BY ws.work_date ASC
      `;
    const [rows]: any = await db.query(sql, [userId]);
    const mappedRows = rows.map((r: any) => ({
      ...r,
      shift: mapToFrontendShift(r.shift),
    }));
    res.json(mappedRows);
  } catch (err) {
    console.error("❌ Get user schedules error:", err);
    res.status(500).json({ error: "Failed to fetch user schedules" });
  }
});

// ✅ เพิ่มหรืออัปเดตหลายรายการ (bulk-upsert)
router.post("/bulk-upsert", async (req, res) => {
  try {
    const schedules = req.body;

    if (!Array.isArray(schedules) || schedules.length === 0) {
      return res
        .status(400)
        .json({ error: "Schedules must be a non-empty array" });
    }

    console.log("📦 Received schedules:", schedules);

    const sql = `
      INSERT INTO work_schedules (user_id, work_date, shift, created_at, updated_at)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        shift = VALUES(shift),
        updated_at = NOW()
    `;

    const values = schedules.map((s: any) => [
      s.user_id,
      s.date,
      mapToDbShift(s.shift), // Convert to ENUM
      new Date(),
      new Date(),
    ]);


    await db.query(sql, [values]);

    // --- Send Notifications ---
    try {
      // Group by user_id to avoid multiple notifications for same user in one update
      const uniqueUserIds = [...new Set(schedules.map((s: any) => s.user_id))];
      
      const notifValues = uniqueUserIds.map((uid: any) => [
        uid,
        "Your work schedule has been updated by your Department Head.",
        0,
        new Date(),
        null, // reference_id (optional)
        'system'
      ]);

      if (notifValues.length > 0) {
        await notificationRepository.createBulkNotifications(notifValues);
      }
    } catch (notifErr) {
      console.error("⚠️ Notification failed but schedule saved:", notifErr);
    }

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
      "DELETE FROM work_schedules WHERE work_date = ?",
      [date],
    );

    res
      .status(200)
      .json({
        message: `✅ Deleted schedules on ${date}`,
        deleted: result.affectedRows,
      });
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

// ✅ ลบกะงานของพนักงานตามวันที่ระบุ (สำหรับกรณีเลือก OFF)
router.delete("/user/:userId/date/:date", async (req, res) => {
  try {
    const { userId, date } = req.params;
    await db.query(
      "DELETE FROM work_schedules WHERE user_id = ? AND work_date = ?",
      [userId, date],
    );

    // --- Send Notification for OFF ---
    try {
      const message = `Your shift on ${date} has been set to OFF (Day Off) by your Department Head.`;
      await notificationRepository.createBulkNotifications([[
        userId,
        message,
        0,
        new Date(),
        null,
        'system'
      ]]);
    } catch (notifErr) {
        console.error("⚠️ Notification failed but shift removed:", notifErr);
    }

    res.status(200).json({ message: "✅ Shift removed (OFF)" });
  } catch (err) {
    console.error("❌ Delete user shift error:", err);
    res.status(500).json({ error: "Failed to remove shift" });
  }
});

export default router;
