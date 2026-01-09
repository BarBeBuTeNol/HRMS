import { Request, Response } from "express";
import masterDataRepository from "../repository/masterDataRepository";

export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const rows = await masterDataRepository.getAllRoles();
    res.json(rows);
  } catch (err: any) {
    console.error("Get Roles Error:", err);
    res.status(500).json({ message: err.message });
  }
};
