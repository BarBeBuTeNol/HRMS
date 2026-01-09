import { Router } from "express";
import pool from "../config/db";

const router = Router();

// ดึงแจ้งเตือนทั้งหมดของ user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await pool.query(
      `SELECT id, message, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(rows);
  } catch (error: any) {
    console.error("❌ Error in /notifications:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
  }
});

// อัพเดทสถานะว่าอ่านแล้ว
router.put("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [id]);
    res.json({ success: true, message: "อัปเดตสถานะอ่านแล้ว" });
  } catch (error: any) {
    console.error("❌ Error in PUT /notifications:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
  }
});

// ส่งแจ้งเตือนใหม่ (POST /api/notifications/send)
import { sendNotification } from "../controllers/notificationController";
router.post("/send", sendNotification);

export default router;
