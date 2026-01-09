import { Request, Response } from "express";
import pool from "../config/db";

// Helper to get date range filters
const getDateFilter = (range: string) => {
  const now = new Date();
  if (range === "today") {
    return `AND sa.shift_date = CURDATE()`;
  } else if (range === "week") {
    return `AND YEARWEEK(sa.shift_date, 1) = YEARWEEK(CURDATE(), 1)`;
  } else if (range === "month") {
    return `AND MONTH(sa.shift_date) = MONTH(CURDATE()) AND YEAR(sa.shift_date) = YEAR(CURDATE())`;
  }
  return "";
};

export const getSwapList = async (req: Request, res: Response) => {
  try {
    const { range, status, department_id } = req.query;

    let sql = `
      SELECT 
        sa.id, 
        sa.shift_date, 
        sa.shift_type, 
        sa.note, 
        sa.created_at,
        users_leave.first_name AS leave_emp_first,
        users_leave.last_name AS leave_emp_last,
        users_delegate.first_name AS delegate_emp_first,
        users_delegate.last_name AS delegate_emp_last,
        dept.department_name,
        -- Mocking status columns if they don't exist yet
        'Approved' as status, 
        IFNULL(sa.note, '') as reason,
        0 as hr_acknowledged
      FROM shift_assignments sa
      JOIN users users_leave ON sa.leave_emp_id = users_leave.id
      JOIN users users_delegate ON sa.delegate_emp_id = users_delegate.id
      LEFT JOIN departments dept ON users_leave.department_id = dept.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (range) {
      sql += getDateFilter(range as string) + " ";
    }
    if (department_id) {
      sql += " AND users_leave.department_id = ? ";
      params.push(department_id);
    }
    
    // Status filter (mock implementation)
    // if (status) { ... }

    sql += " ORDER BY sa.shift_date DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error: any) {
    console.error("Error fetching swap list:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getSwapStats = async (req: Request, res: Response) => {
  try {
    // 1. Top 5 Swappers (Requestors)
    const [topSwappers] = await pool.query(`
      SELECT CONCAT(u.first_name, ' ', u.last_name) as name, COUNT(*) as count 
      FROM shift_assignments sa
      JOIN users u ON sa.leave_emp_id = u.id
      GROUP BY sa.leave_emp_id
      ORDER BY count DESC LIMIT 5
    `);

    // 2. Top 5 Helpers (Delegates)
    const [topHelpers] = await pool.query(`
      SELECT CONCAT(u.first_name, ' ', u.last_name) as name, COUNT(*) as count 
      FROM shift_assignments sa
      JOIN users u ON sa.delegate_emp_id = u.id
      GROUP BY sa.delegate_emp_id
      ORDER BY count DESC LIMIT 5
    `);

    // 3. Department Heatmap
    const [deptHeatmap] = await pool.query(`
      SELECT d.department_name, COUNT(*) as count
      FROM shift_assignments sa
      JOIN users u ON sa.leave_emp_id = u.id
      JOIN departments d ON u.department_id = d.id
      GROUP BY d.id
    `);

    // 4. Swap Volume (Monthly)
    const [swapVolume] = await pool.query(`
      SELECT DATE_FORMAT(shift_date, '%Y-%m') as month, COUNT(*) as count
      FROM shift_assignments
      GROUP BY month
      ORDER BY month ASC LIMIT 12
    `);

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
