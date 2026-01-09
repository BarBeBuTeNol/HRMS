import { Request, Response } from "express";
import masterDataRepository from "../repository/masterDataRepository";

export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const rows = await masterDataRepository.getAllDepartments();
    res.json(rows);
  } catch (err: any) {
    console.error("Get Departments Error:", err);
    res.status(500).json({ message: err.message });
  }
};
