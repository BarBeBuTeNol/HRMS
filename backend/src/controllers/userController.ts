// src/controllers/users.controller.ts
import { Request, Response } from "express";
import pool from "../config/db";

// GET /api/users?search=&role=&department=&page=1&pageSize=20
export const listUsers = async (req: Request, res: Response) => {
  try {
    const {
      search = "",
      role = "",
      department = "",
      page = "1",
      pageSize = "20",
    } = req.query as Record<string, string>;

    const _pageSize = Number.isFinite(parseInt(pageSize)) ? Math.max(1, parseInt(pageSize)) : 20;
    const _page = Number.isFinite(parseInt(page)) ? Math.max(1, parseInt(page)) : 1;

    const limit = _pageSize;
    const offset = (_page - 1) * limit;

    const filters: string[] = [];
    const params: any[] = [];

    if (search) {
      const like = `%${search}%`;
      filters.push(`(u.username LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`);
      params.push(like, like, like, like, like);
    }
    if (role) {
      filters.push(`r.role_name = ?`);
      params.push(role);
    }
    if (department) {
      filters.push(`d.department_name = ?`);
      params.push(department);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `
      SELECT 
        u.id, u.username, u.first_name, u.last_name, u.email, u.phone,
        r.role_name, d.department_name, p.prefix_name,
        ei.job_position, ei.emp_code
      FROM users u
      LEFT JOIN roles r        ON u.role_id = r.id
      LEFT JOIN departments d  ON u.department_id = d.id
      LEFT JOIN prefixes p     ON u.prefix_id = p.id
      LEFT JOIN emp_info ei    ON u.id = ei.user_id
        AND ei.id = (SELECT MAX(id) FROM emp_info WHERE user_id = u.id) -- Get latest job info
      LEFT JOIN user_detail ud ON u.id = ud.user_id
      ${where}
      ORDER BY u.id DESC
      LIMIT ${limit} OFFSET ${offset}
      `,
      params
    );

    const [countRows] = await pool.query(
      `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN roles r        ON u.role_id = r.id
      LEFT JOIN departments d  ON u.department_id = d.id
      ${where}
      `,
      params
    );

    const total = (countRows as any[])[0]?.total ?? 0;

    res.json({
      data: rows,
      pagination: {
        page: _page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/:id
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [userRows] = await pool.query(
      `
      SELECT 
        u.*, r.role_name, d.department_name, p.prefix_name,
        ud.address, ud.birthdate as birth_date, ud.gender, ud.marital_status,
        ud.nationality, ud.religion, ud.blood_type,
        ud.emergency_contact_name, ud.emergency_contact_phone, 
        ud.relation_to_emergency_contact,
        ei.emp_code, ei.employment_status, ei.work_start_time, ei.work_end_time,
        ei.hire_date, ei.salary, ei.benefits, ei.job_position,
        ei.performance_review, ei.training_info,
        edu.education_level, edu.institution, edu.program, edu.skills, edu.previous_experience
      FROM users u
      LEFT JOIN roles r        ON u.role_id = r.id
      LEFT JOIN departments d  ON u.department_id = d.id
      LEFT JOIN prefixes p     ON u.prefix_id = p.id
      LEFT JOIN user_detail ud ON ud.user_id = u.id
      LEFT JOIN emp_info ei    ON ei.user_id = u.id AND ei.id = (SELECT MAX(id) FROM emp_info WHERE user_id = u.id)
      LEFT JOIN education_info edu ON edu.user_id = u.id AND edu.id = (SELECT MAX(id) FROM education_info WHERE user_id = u.id)
      WHERE u.id = ?
      `,
      [id]
    );

    const user = (userRows as any[])[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    const reqUser: any = (req as any).user;
    if (reqUser?.role === "Employee" && Number(reqUser?.id) !== Number(id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users
export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      empId,
      username,
      password,
      firstName, first_name,
      lastName, last_name,
      email,
      telephone, phone,
      role = "Employee",
      department_id = null,
      prefix_id = null
    } = req.body;

    const fName = first_name || firstName;
    const lName = last_name || lastName;
    const tel = phone || telephone;

    if (!username || !password || !fName || !lName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [existing] = await pool.query(
        "SELECT id FROM users WHERE username = ? OR email = ?",
        [username, email]
    );
    if ((existing as any[]).length > 0) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    let roleId = null;
    const [roles] = await pool.query("SELECT id FROM roles WHERE role_name = ?", [role]);
    if ((roles as any[]).length > 0) {
      roleId = (roles as any[])[0].id;
    }

    const [result] = await pool.query(
      `INSERT INTO users 
       (username, password, first_name, last_name, email, phone, role_id, department_id, prefix_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [username, hashedPassword, fName, lName, email, tel, roleId, department_id, prefix_id]
    );

    const newUserId = (result as any).insertId;

    await pool.query(
      `INSERT INTO user_logs (user_id, action, details, created_at)
       VALUES (?, ?, ?, NOW())`,
      [newUserId, "Create User", `Created user ${username} (EmpID: ${empId})`]
    );

    res.status(201).json({ 
        message: "User created successfully", 
        userId: newUserId 
    });

  } catch (err: any) {
    console.error("Create User Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req: Request, res: Response) => {
  const connection = await pool.getConnection(); // Use transaction
  try {
    const { id } = req.params;
    
    await connection.beginTransaction();

    // Delete related data first (Optional if Foreign Keys have ON DELETE CASCADE)
    // Assuming ON DELETE CASCADE is set up in DB, simple delete on users is enough.
    // If not, manual deletion is safer.
    
    // Check if user exists
    const [user] = await connection.query("SELECT username FROM users WHERE id = ?", [id]);
    if ((user as any[]).length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "User not found" });
    }

    // Explicitly delete related data
    await connection.query("DELETE FROM user_sessions WHERE user_id = ?", [id]);
    await connection.query("DELETE FROM user_logs WHERE user_id = ?", [id]);
    await connection.query("DELETE FROM education_info WHERE user_id = ?", [id]);
    await connection.query("DELETE FROM emp_info WHERE user_id = ?", [id]);
    await connection.query("DELETE FROM user_detail WHERE user_id = ?", [id]);
    
    // Finally delete the user
    await connection.query("DELETE FROM users WHERE id = ?", [id]);

    await connection.commit();
    res.json({ message: "User deleted successfully" });
  } catch (err: any) {
    await connection.rollback();
    console.error("Delete User Error:", err);
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};
