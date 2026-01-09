import { Request, Response } from "express";
import masterDataRepository from "../repository/masterDataRepository";

export const getAllPrefixes = async (req: Request, res: Response) => {
  try {
    const rows = await masterDataRepository.getAllPrefixes();
    res.json(rows);
  } catch (err: any) {
    console.error("Get Prefixes Error:", err);
    res.status(500).json({ message: err.message });
  }
};
