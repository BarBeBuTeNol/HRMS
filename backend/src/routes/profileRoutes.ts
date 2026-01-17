import { Router } from "express";
import pool from "../config/db";
import { RowDataPacket } from "mysql2";

const router = Router();

const USER_BASE = `
  SELECT 
    u.id, u.username, u.email, u.phone,
    u.first_name, u.last_name, u.role_id, u.department_id,
    u.prefix as prefix_name,
    CONCAT(COALESCE(u.prefix, ''), u.first_name, ' ', u.last_name) AS full_name,
    r.role_name, d.department_name
  FROM users u
  LEFT JOIN roles r       ON r.id = u.role_id
  LEFT JOIN departments d ON d.id = u.department_id
`;

// ------------------ GET PROFILE ------------------
router.get("/:id/profile", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid id" });

  try {
    // 1. Users Basic Info
    const [urows] = await pool.query<RowDataPacket[]>(
      `${USER_BASE} WHERE u.id = ? LIMIT 1`, [id]
    );
    if (!urows.length) return res.status(404).json({ error: "User not found" });
    const u = urows[0];

    // 2. Personal Detail
    const [drows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM user_detail WHERE user_id = ? LIMIT 1`, [id]
    );
    const d = drows.length ? drows[0] : null;

    // 3. Employment Info
    const [erows] = await pool.query<RowDataPacket[]>(
      `SELECT 
         e.*, 
         j.position_name as job_name,
         dep.department_name as emp_dept_name
       FROM emp_info e
       LEFT JOIN job_positions j ON e.position_id = j.id
       LEFT JOIN departments dep ON e.department_id = dep.id
       WHERE e.user_id = ? LIMIT 1`, [id]
    );
    const emp = erows.length ? erows[0] : null;

    // 4. Education Info
    const [edrows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM education_info WHERE user_id = ? LIMIT 1`, [id]
    );
    const edu = edrows.length ? edrows[0] : null;

    const payload = {
      // --- USERS ---
      id: u.id,
      full_name: u.full_name,
      role_name: u.role_name,
      department_name: u.department_name,
      email: u.email,
      phone: u.phone,
      profile_pic: d?.profile_pic || null,

      // --- USER_DETAIL ---
      gender: d?.gender || null,
      birthday: d?.birthdate || null,
      address: d?.address || "",
      maritalStatus: d?.marital_status || null,
      nationality: d?.nationality || null,
      religion: d?.religion || null,
      bloodType: d?.blood_type || null,

      emergencyContact: {
        name: d?.emergency_contact_name || "",
        phone: d?.emergency_contact_phone || "",
        relation: d?.relation_to_emergency_contact || ""
      },

      // --- EMPLOYMENT INFO ---
      work: {
         empCode: emp?.emp_code || "-",
         jobTitle: emp?.job_name || u.role_name, // Fallback to role if job not set
         department: emp?.emp_dept_name || u.department_name,
         startOption: emp?.work_start_time || "-",
         endOption: emp?.work_end_time || "-",
         hireDate: emp?.hire_date || "-",
         status: emp?.employment_status || "Active",
         salary: emp?.salary || 0,
         benefits: emp?.benefits || "-",
         training: emp?.training_info || "-"
      },

      // --- EDUCATION INFO ---
      education: {
         level: edu?.education_level || "-",
         institution: edu?.institution || "-",
         program: edu?.program || "-",
         skills: edu?.skills || "-",
         experience: edu?.previous_experience || "-"
      },

      createdAt: d?.created_at || null,
      updatedAt: d?.updated_at || null
    };

    res.json(payload);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
