import { Request, Response } from "express";
import swapReportRepository from "../repository/swapReportRepository";

// Helper to get date range filters
const getDateFilter = (range: string) => {
  if (range === "today") {
    return `AND ws.work_date = CURDATE()`;
  } else if (range === "week") {
    return `AND YEARWEEK(ws.work_date, 1) = YEARWEEK(CURDATE(), 1)`;
  } else if (range === "month") {
    return `AND MONTH(ws.work_date) = MONTH(CURDATE()) AND YEAR(ws.work_date) = YEAR(CURDATE())`;
  }
  return "";
};

export const getSwapList = async (req: Request, res: Response) => {
  try {
    const { range, status, department_id } = req.query;

    const dateFilter = range ? getDateFilter(range as string) : "";
    const params: any[] = [];
    if (department_id) {
        params.push(department_id);
    }

    const rows = await swapReportRepository.getSwapList(dateFilter, department_id as string | undefined, params);
    
    res.json(rows);
  } catch (error: any) {
    console.error("Error fetching swap list:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getSwapStats = async (req: Request, res: Response) => {
  try {
    // 1. Top 5 Swappers (Requestors)
    const topSwappers = await swapReportRepository.getTopSwappers();

    // 2. Top 5 Helpers (Delegates)
    const topHelpers = await swapReportRepository.getTopHelpers();

    // 3. Department Heatmap
    const deptHeatmap = await swapReportRepository.getDepartmentHeatmap();

    // 4. Swap Volume (Monthly)
    const swapVolume = await swapReportRepository.getSwapVolume();

    res.json({
      topSwappers,
      topHelpers,
      deptHeatmap,
      swapVolume
    });
  } catch (error: any) {
    console.error("Error fetching swap stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifySwap = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // In a real scenario, we would update a column here. 
    // For now, we'll just return success to simulate the action.
    /*
    await pool.query(
      "UPDATE shift_assignments SET hr_acknowledged = 1 WHERE id = ?", 
      [id]
    );
    */
    res.json({ success: true, message: "Swap acknowledged" });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
