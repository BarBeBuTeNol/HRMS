import { Request, Response } from 'express';
import workScheduleRepository from "../repository/workScheduleRepository";

export const bulkUpsertSchedules = async (req: Request, res: Response) => {
  const schedules = req.body;
  try {
    if (!Array.isArray(schedules) || schedules.length === 0) {
        return res.status(400).json({ error: "Invalid data format or empty list" });
    }

    await workScheduleRepository.bulkUpsertSchedules(schedules);

    res.json({ message: "บันทึกข้อมูลสำเร็จ" });
  } catch (err) {
    console.error("❌ Error saving schedules:", err);
    res.status(500).json({ error: "บันทึกไม่สำเร็จ" });
  }
};
