import { Request, Response } from "express";
import pool from "../config/db";
import { RowDataPacket } from "mysql2";

export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT id, department_name FROM departments ORDER BY id ASC");
    res.json(rows);
  } catch (err: any) {
    console.error("Get Departments Error:", err);
    res.status(500).json({ message: err.message });
  }
};
