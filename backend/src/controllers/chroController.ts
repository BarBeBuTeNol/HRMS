import { Request, Response } from "express";
import pool from "../config/db";
import { RowDataPacket } from "mysql2";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();

    try {
      // 1. Total Employees
      const [totalRows] = await connection.query<RowDataPacket[]>(
        "SELECT COUNT(*) as count FROM users"
      );
      const totalEmployees = totalRows[0].count;

      // 2. Active Personnel (using user_sessions - users active in last 15 mins)
      const [activeRows] = await connection.query<RowDataPacket[]>(
        "SELECT COUNT(DISTINCT user_id) as count FROM user_sessions WHERE last_activity >= NOW() - INTERVAL 15 MINUTE"
      );
      const activeEmployees = activeRows[0].count;

      // 3. Department Stats
      const [deptRows] = await connection.query<RowDataPacket[]>(
        `SELECT d.id, d.department_name as name, COUNT(u.id) as count, SUM(ei.salary) as budget
         FROM departments d
         LEFT JOIN users u ON d.id = u.department_id
         LEFT JOIN emp_info ei ON u.id = ei.user_id
         GROUP BY d.id`
      );
      
      // Calculate a mock "score" for departments based on some logic or random for now as it's not in DB
      // In a real app, this might come from KPIs. We'll simulate it for visual consistency.
      const departmentStats = deptRows.map((d: any) => ({
        ...d,
        budget: d.budget || 0,
        score: Math.floor(Math.random() * (98 - 80) + 80) // Placeholder Score
      }));

      // 4. Demographics (Gender)
      const [genderRows] = await connection.query<RowDataPacket[]>(
        `SELECT ud.gender, COUNT(*) as count 
         FROM user_detail ud 
         JOIN users u ON ud.user_id = u.id
         GROUP BY ud.gender`
      );
      
      const genderDistribution = {
        male: 0,
        female: 0,
        other: 0
      };
      
      genderRows.forEach((row: any) => {
        const g = row.gender?.toLowerCase();
        if (g === 'male' || g === 'ชาย') genderDistribution.male = row.count;
        else if (g === 'female' || g === 'หญิง') genderDistribution.female = row.count;
        else genderDistribution.other += row.count;
      });

      // 5. Avg Salary
      const [salaryRow] = await connection.query<RowDataPacket[]>(
        "SELECT AVG(salary) as avg_salary FROM emp_info"
      );
      const avgSalary = parseFloat(salaryRow[0].avg_salary || 0);

      // 6. Recent Activities
      const [activityRows] = await connection.query<RowDataPacket[]>(
        `SELECT id, action as message, created_at as time, 'info' as type 
         FROM user_logs 
         ORDER BY id DESC 
         LIMIT 5`
      );
      
      // Format time to "X hours ago" style could be done here or frontend. 
      // We'll send raw date and let frontend handle relative time or do simple format.

      res.json({
        totalEmployees,
        activeEmployees,
        departments: departmentStats.length,
        turnoverRate: 0, // Placeholder as we don't have historical firing data easily yet
        avgSalary,
        genderDistribution,
        departmentStats,
        recentActivities: activityRows
      });

    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error("CHRO Stats Error:", err);
    res.status(500).json({ message: err.message });
  }
};
