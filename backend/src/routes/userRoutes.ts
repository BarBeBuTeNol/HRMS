import { Router } from "express";
import pool from "../config/db";
import { RowDataPacket } from "mysql2";

const router = Router();

/** คิวรีหลัก (ไม่มี user_detail) */
const USER_SELECT = `
  SELECT 
    u.id,
    u.username,
    u.email,
    u.phone,
    u.first_name,
    u.last_name,
    u.role_id,
    u.department_id,
    p.prefix_name,
    CONCAT(COALESCE(p.prefix_name, ''), u.first_name, ' ', u.last_name) AS full_name,
    r.role_name,
    d.department_name
  FROM users u
  LEFT JOIN prefixes p     ON p.id = u.prefix_id
  LEFT JOIN roles r        ON r.id = u.role_id
  LEFT JOIN departments d  ON d.id = u.department_id
`;

/** ───────── GET /api/users (list ทั้งหมด) ───────── */
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `${USER_SELECT} ORDER BY u.id`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "DB error" });
  }
});

/** ───────── GET /api/users/:id ───────── */
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid id" });

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `${USER_SELECT} WHERE u.id = ? LIMIT 1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error fetching user by id:", err);
    res.status(500).json({ error: "DB error" });
  }
});

router.get("/head/employees", async (req, res) => {
  const departmentId = Number(req.query.departmentId);
  if (!departmentId) return res.status(400).json({ error: "Missing departmentId" });

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        u.id,
        CONCAT(COALESCE(p.prefix_name,''), u.first_name, ' ', u.last_name) AS name,
        r.role_name,
        d.department_name
      FROM users u
      LEFT JOIN prefixes p  ON u.prefix_id = p.id
      LEFT JOIN roles r     ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.department_id = ?
      ORDER BY u.id ASC
      `,
      [departmentId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching employees by department:", err);
    res.status(500).json({ error: "DB error" });
  }
});


/** ───────── GET /api/users/employee/:id/detail ───────── 
 * ดึงข้อมูลรายละเอียดพนักงานแบบเต็ม
 */
router.get("/employee/:id/detail", async (req, res) => {
  const empId = Number(req.params.id);
  if (!empId) return res.status(400).json({ error: "Invalid employee id" });

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        u.id,
        CONCAT(COALESCE(p.prefix_name,''), u.first_name, ' ', u.last_name) AS full_name,
        u.email,
        u.phone,
        r.role_name,
        d.department_name,
        ud.birthday,
        ud.gender,
        ud.nationality,
        ud.religion,
        ud.ethnicity,
        ud.blood_type,
        ud.address,
        ud.marital_status,
        ud.start_date
      FROM users u
      LEFT JOIN prefixes p   ON u.prefix_id = p.id
      LEFT JOIN roles r      ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN user_detail ud ON u.id = ud.user_id
      WHERE u.id = ?
        AND u.role_id = 5
      `,
      [empId]
    );

    if (!rows.length) return res.status(404).json({ error: "Employee not found" });
    res.json(rows[0]);
  } catch (err: any) {
    console.error("❌ SQL ERROR:", err.sqlMessage || err.message);
    res.status(500).json({ error: err.sqlMessage || "DB error" });
  }
});


export default router;
