import { Request, Response } from 'express';
import workScheduleRepository from "../repository/workScheduleRepository";

export const bulkUpsertSchedules = async (req: Request, res: Response) => {
  const schedules = req.body;
  try {
    if (!Array.isArray(schedules) || schedules.length === 0) {
        return res.status(400).json({ error: "Invalid data format or empty list" });
    }

    await workScheduleRepository.bulkUpsertSchedules(schedules);

// ... existing code ...
    res.json({ message: "บันทึกข้อมูลสำเร็จ" });
  } catch (err) {
    console.error("❌ Error saving schedules:", err);
    res.status(500).json({ error: "บันทึกไม่สำเร็จ" });
  }
};

export const getMySchedules = async (req: Request, res: Response) => {
    try {
        const { userId, startDate, endDate } = req.query;

        if (!userId || !startDate || !endDate) {
            return res.status(400).json({ message: "Missing required parameters" });
        }

        const schedules = await workScheduleRepository.findSchedulesByRange(
            userId as string, 
            startDate as string, 
            endDate as string
        );
        
        res.json(schedules);
    } catch (err: any) {
        console.error("❌ Error fetching schedules:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};
