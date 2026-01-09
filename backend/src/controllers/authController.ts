import { Request, Response } from "express";
import authRepository from "../repository/authRepository";

/** POST /api/auth/login  body: {username, password} */
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string };

  // 🔍 LOG 1: เช็กค่าที่ frontend ส่งมา
  console.log("LOGIN BODY:", { username, password });

  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "username/password is required" });
  }

  try {
    const user = await authRepository.findUserByCredentials(username);

    // 🔍 LOG 2: เช็กผลลัพธ์จาก DB
    console.log("DB RESULT:", user ? [user] : []);

    // Check if user exists AND password matches (Plaintext check to match original SQL behavior)
    // Note: In a production environment with hashed passwords, use bcrypt.compare here.
    if (!user || user.password !== password) {
      return res.status(401).json({ ok: false, message: "Invalid credentials" });
    }

    const { password: _pw, ...userData } = user;
    return res.json({ ok: true, user: userData });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

