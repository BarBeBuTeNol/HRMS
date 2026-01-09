import { Router } from "express";
import pool from "../config/db";
import { RowDataPacket } from "mysql2";
import { createUser, deleteUser, getUserById, listUsers } from "../controllers/userController";

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

// ✅ Define static routes BEFORE dynamic routes like /:id
/** ───────── GET /api/users/active-status ───────── 
 * เช็คสถานะ Active Users from user_sessions (last_activity < 5 mins ago)
 */
router.get("/active-status", async (_req, res) => {
  try {
    // 1. Get Total Users Count
    const [totalRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM users`
    );
    const totalUsers = totalRows[0]?.count || 0;

    // 2. Get Users with Active Status from user_sessions
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
         u.id, 
         u.username, 
         u.email, 
         r.role_name,
         us.last_activity,
         IF(us.last_activity >= NOW() - INTERVAL 5 MINUTE, 1, 0) as is_online
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN user_sessions us ON u.id = us.user_id
       ORDER BY us.last_activity DESC`
    );

    const usersWithStatus = rows.map((u) => ({
      ...u,
      status: u.is_online ? "Online" : "Offline",
      last_login: u.last_activity, // Display last activity
    }));

    const onlineCount = usersWithStatus.filter((u) => u.status === "Online").length;
    // console.log(`🔍 Active Status Check: Total ${totalUsers}, Online ${onlineCount}`);

    res.json({
      ok: true,
      totalUsers,
      onlineCount,
      users: usersWithStatus,
    });
  } catch (err) {
    console.error("❌ Error checking active status:", err);
    res.status(500).json({ error: "DB error" });
  }
});

/** ───────── POST /api/users/heartbeat ───────── 
 * Upsert into user_sessions
 */
router.post("/heartbeat", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });
    
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';

    // console.log(`💓 Heartbeat received for User ID: ${userId} from IP: ${ip}`);
    
    // Upsert into user_sessions
    await pool.query(`
      INSERT INTO user_sessions (user_id, ip_address, last_activity)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
        ip_address = VALUES(ip_address),
        last_activity = NOW()
    `, [userId, ip]);

    res.json({ ok: true });
  } catch (err: any) {
    console.error("❌ Error updating heartbeat:", err.message);
    res.status(500).json({ error: "DB error" });
  }
});



// ...

/** ───────── GET /api/users (list ทั้งหมด) ───────── */
router.get("/", listUsers);

/** ───────── GET /api/users/:id ───────── */
router.get("/:id", getUserById);

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


// POST /api/users
router.post("/", createUser);
router.delete("/:id", deleteUser);

// Endpoint /active-status moved to top
export default router;
