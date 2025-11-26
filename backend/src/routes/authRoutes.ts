import { Router } from "express";
import pool from "../config/db";
import { RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  role_id: number;
  password: string;
  department_id: number; // ✅ เพิ่มเข้ามา
}

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "❌ ต้องกรอก username และ password" });
  }

  try {
    // ✅ ดึง user พร้อม department_id
    const [rows] = await pool.query<UserRow[]>(
      `SELECT id, username, role_id, department_id, password
       FROM users
       WHERE username = ?
       LIMIT 1`,
      [username]
    );

    if (!rows.length) {
      return res.status(401).json({ ok: false, message: "❌ ไม่พบผู้ใช้" });
    }

    const user = rows[0];

    // ✅ เทียบ password (ตอนนี้ plain-text ตรง ๆ)
    if (user.password !== password) {
      return res.status(401).json({ ok: false, message: "❌ รหัสผ่านไม่ถูกต้อง" });
    }

    // ✅ ไม่ส่ง password กลับไป
    const { password: _pw, ...safeUser } = user;

    return res.json({ ok: true, user: safeUser }); 
    // 👆 safeUser จะมี {id, username, role_id, department_id}
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ ok: false, message: "⚠️ Server error" });
  }
});

export default router;
