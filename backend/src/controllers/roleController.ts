import { Request, Response } from "express";
import pool from "../config/db";

export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT id, role_name FROM roles ORDER BY id ASC");
    res.json(rows);
  } catch (err: any) {
    console.error("Get Roles Error:", err);
    res.status(500).json({ message: err.message });
  }
};
