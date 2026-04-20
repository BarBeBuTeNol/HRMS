import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import authRepository from "../repository/authRepository";
import userRepository from "../repository/userRepository";

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

    // Check if user exists
    if (!user) {
      return res.status(401).json({ ok: false, message: "Invalid credentials" });
    }

    // Check if account is locked
    if (user.locked_until) {
      const lockTime = new Date(user.locked_until).getTime();
      const now = new Date().getTime();
      if (lockTime > now) {
        const minutesLeft = Math.ceil((lockTime - now) / 60000);
        return res.status(403).json({ 
          ok: false, 
          message: `Account is locked due to multiple failed login attempts. Please try again in ${minutesLeft} minute(s).` 
        });
      }
    }

    // Check if password matches
    let isMatch = false;
    if (user.password && user.password.startsWith('$2')) {
      // It's a bcrypt hash
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Fallback for plain text (legacy users)
      isMatch = user.password === password;
    }

    if (!isMatch) {
      // Increment failed attempts
      await authRepository.incrementFailedAttempts(user.id);
      
      const newAttempts = (user.failed_login_attempts || 0) + 1;
      if (newAttempts >= 3) {
        await authRepository.lockAccount(user.id, 15);
        return res.status(403).json({ 
          ok: false, 
          message: "Account has been locked due to 3 failed login attempts. Please try again in 15 minutes." 
        });
      }

      return res.status(401).json({ 
        ok: false, 
        message: `Invalid credentials. Attempt ${newAttempts} of 3.` 
      });
    }

    // Reset failed attempts upon successful login
    if ((user.failed_login_attempts && user.failed_login_attempts > 0) || user.locked_until) {
        await authRepository.resetFailedAttempts(user.id);
    }

    const { password: _pw, ...userData } = user;

    // ✅ Generate Token
    // TODO: Add JWT_SECRET to .env
    const token = jwt.sign(
        { id: user.id, role: (user as any).role_name }, 
       process.env.JWT_SECRET || 'fallback-secret-key-change-me', 
        { expiresIn: '1d' }
    );

    // Log the successful login
    const ip = req.ip || req.socket.remoteAddress || 'Unknown';
    // Use userRepository for logging
    await userRepository.logAction(
        userData.id, 
        'LOGIN', 
        `User ${userData.username} logged in successfully using ${(userData as any).role_name || 'unknown role'} role.`, 
        ip as string, 
        'Info'
    );

    return res.json({ ok: true, user: userData, token });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

