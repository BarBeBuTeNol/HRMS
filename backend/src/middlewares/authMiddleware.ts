import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import pool from "../config/db";
import { RowDataPacket } from "mysql2";

export interface AuthUser {
  id: number;
  role: string; // "Admin" | "HR" | "CHRO" | "Head" | "Employee"
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const payload = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fallback-secret-key-change-me'
    ) as AuthUser;
    req.user = payload;

    // Check if the current token matches the stored token in DB to prevent concurrent logins
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT token FROM user_sessions WHERE user_id = ?`,
      [payload.id]
    );

    if (rows.length > 0 && rows[0].token && rows[0].token !== token) {
      return res.status(401).json({ 
        message: "Session expired (logged in from another device)",
        code: "LOGGED_IN_ELSEWHERE" 
      });
    }

    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const allowRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
