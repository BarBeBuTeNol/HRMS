import { Request, Response } from "express";
import jobPositionRepository from "../repository/jobPositionRepository";

export const getJobPositions = async (req: Request, res: Response) => {
    try {
        const positions = await jobPositionRepository.getAllJobPositions();
        res.json(positions);
    } catch (error: any) {
        console.error("Error fetching job positions:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
