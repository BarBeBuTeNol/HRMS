import { Router } from "express";
import pool from "../config/db";
import { logUserAction } from "../utils/activityLogger";
import { RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  role_id: number;
  role_name: string; // ✅ เพิ่มเข้ามา
  password: string;
  department_id: number;
}

const router = Router();

router.post("/login", async (req, res) => {
  console.log("🔥 LOGIN HIT");
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "❌ ต้องกรอก username และ password" });
  }

  try {
    // 1. Join roles table เพื่อเอา role_name
    const [rows] = await pool.query<UserRow[]>(
      `SELECT u.id, u.username, u.role_id, u.department_id, u.password, r.role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.username = ?
       LIMIT 1`,
      [username]
    );

    if (!rows.length) {
      return res.status(401).json({ ok: false, message: "❌ ไม่พบผู้ใช้" });
    }

    const user = rows[0];

    // 2. ตรวจสอบรหัสผ่าน
    const bcrypt = require("bcryptjs");
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      if (user.password !== password) {
         return res.status(401).json({ ok: false, message: "❌ รหัสผ่านไม่ถูกต้อง" });
      }
    }

    // 3. ✅ Update User Session for Real-time Status (Only)
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
    await pool.query(
      `INSERT INTO user_sessions (user_id, ip_address, last_activity)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE 
       ip_address = VALUES(ip_address),
       last_activity = NOW()`,
      [user.id, ip]
    );

    // ✅ บันทึกการกระทำ (User Log)
    await logUserAction(user.id, "LOGIN", "User logged in via Web");

    // 4. ส่งข้อมูลกลับ (ไม่ส่ง password)
    const { password: _pw, ...safeUser } = user;

    console.log("✅ Login Success:", safeUser);
    return res.json({ ok: true, user: safeUser }); 
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ ok: false, message: "⚠️ Server error" });
  }
});

export default router;
