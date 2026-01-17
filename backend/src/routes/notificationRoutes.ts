import { Router } from "express";
import { getNotifications, markAsRead, sendNotification } from "../controllers/notificationController";

const router = Router();

// ดึงแจ้งเตือนทั้งหมดของ user
router.get("/:userId", getNotifications);

// อัพเดทสถานะว่าอ่านแล้ว
router.put("/:id/read", markAsRead);

// ส่งแจ้งเตือนใหม่ (POST /api/notifications/send)
router.post("/send", sendNotification);

export default router;
