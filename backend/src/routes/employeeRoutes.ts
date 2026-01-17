import { Router } from "express";
import pool from "../config/db";
import { getEmployeeDashboardData } from '../controllers/employeeDashboardController';

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { departmentId } = req.query;

    if (!departmentId) {
      return res.status(400).json({ error: "ต้องระบุ departmentId" });
    }

    const [rows] = await pool.query(
  `SELECT u.id, CONCAT(p.prefix_name, u.first_name, ' ', u.last_name) AS name, u.department_id
   FROM users u
   LEFT JOIN prefixes p ON u.prefix_id = p.id
   LEFT JOIN roles r ON u.role_id = r.id
   WHERE u.department_id = ? AND r.role_name = 'Employee'`,
  [departmentId]  // ✅ ตรงนี้จะแทนค่า ? ให้
);


    res.json(rows);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});
router.get('/dashboard/:userId', getEmployeeDashboardData);

// Export
export default router;
