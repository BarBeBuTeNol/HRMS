import { Request, Response } from "express";
import chroRepository from "../repository/chroRepository";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
      // 1. Total Employees
      const totalEmployees = await chroRepository.getTotalEmployees();

      // 2. Active Personnel (using user_sessions - users active in last 15 mins)
      const activeEmployees = await chroRepository.getActiveEmployees();

      // 3. Department Stats
      const deptRows = await chroRepository.getDepartmentStats();
      
      // Calculate a mock "score" for departments based on some logic or random for now as it's not in DB
      // In a real app, this might come from KPIs. We'll simulate it for visual consistency.
      const departmentStats = deptRows.map((d: any) => ({
        ...d,
        budget: d.budget || 0,
        score: Math.floor(Math.random() * (98 - 80) + 80) // Placeholder Score
      }));

      // 4. Demographics (Gender)
      const genderRows = await chroRepository.getGenderDistribution();
      
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
      const avgSalary = await chroRepository.getAverageSalary();

      // 6. Recent Activities
      const activityRows = await chroRepository.getRecentActivities();
      
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

  } catch (err: any) {
    console.error("CHRO Stats Error:", err);
    res.status(500).json({ message: err.message });
  }
};
