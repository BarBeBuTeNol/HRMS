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

export const createDepartment = async (req: Request, res: Response) => {
    try {
        const { department_name } = req.body;
        if (!department_name) {
             return res.status(400).json({ message: "Department name is required" });
        }
        await masterDataRepository.createDepartment(department_name);
        res.status(201).json({ message: "Department created successfully" });
    } catch (err: any) {
        console.error("Create Department Error:", err);
        res.status(500).json({ message: err.message });
    }
};
