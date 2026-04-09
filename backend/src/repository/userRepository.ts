import pool from "../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface UserFilterParams {
  search?: string;
  role?: string;
  department?: string;
  limit: number;
  offset: number;
}

interface LogFilterParams {
  search?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  limit: number;
  offset: number;
}

class UserRepository {
  async findAll(params: UserFilterParams) {
    const { search, role, department, limit, offset } = params;

    const filters: string[] = [];
    const queryParams: any[] = [];

    if (search) {
      const like = `%${search}%`;
      filters.push(
        `(u.first_name LIKE ? OR u.last_name LIKE ? OR ei.emp_code LIKE ? OR r.role_name LIKE ?)`,
      );
      queryParams.push(like, like, like, like);
    }
    if (role) {
      filters.push(`r.role_name = ?`);
      queryParams.push(role);
    }
    if (department) {
      filters.push(`d.department_name = ?`);
      queryParams.push(department);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const [rows] = await pool.query<RowDataPacket[]>(
      `
            SELECT 
                u.id, u.username, u.first_name, u.last_name, u.email, u.phone,
                u.status, u.prefix as prefix_name,
                (SELECT MAX(last_activity) FROM user_sessions WHERE user_id = u.id) as last_active,
                r.role_name, d.department_name,
                ei.position_id, jp.position_name AS job_position, ei.emp_code, ei.employment_status,
                ud.profile_image_url
            FROM users u
            LEFT JOIN roles r        ON u.role_id = r.id
            LEFT JOIN departments d  ON u.department_id = d.id
            LEFT JOIN user_detail ud ON u.id = ud.user_id
            LEFT JOIN emp_info ei    ON u.id = ei.user_id
                AND ei.id = (SELECT MAX(id) FROM emp_info WHERE user_id = u.id)
            LEFT JOIN job_positions jp ON ei.position_id = jp.id
            ${where}
            ORDER BY u.id DESC
            LIMIT ${limit} OFFSET ${offset}
            `,
      queryParams,
    );

    const [countRows] = await pool.query<RowDataPacket[]>(
      `
            SELECT COUNT(*) as total
            FROM users u
            LEFT JOIN roles r        ON u.role_id = r.id
            LEFT JOIN departments d  ON u.department_id = d.id
            LEFT JOIN emp_info ei    ON u.id = ei.user_id 
                AND ei.id = (SELECT MAX(id) FROM emp_info WHERE user_id = u.id)
            ${where}
            `,
      queryParams,
    );

    const total = countRows[0]?.total ?? 0;

    return { rows, total };
  }

  async findById(id: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
            SELECT 
                u.*, r.role_name, d.department_name, u.prefix as prefix_name,
                ud.address, ud.birthdate as birth_date, ud.gender, ud.marital_status,
                ud.personal_id, ud.nationality, ud.religion, ud.blood_type,
                ud.emergency_contact_name, ud.emergency_contact_phone, 
                ud.relation_to_emergency_contact, ud.profile_image_url,
                ei.emp_code, ei.employment_status, ei.work_start_time, ei.work_end_time,
                ei.hire_date, ei.salary, ei.benefits, ei.position_id, jp.position_name AS job_position,
                ei.performance_review, ei.training_info,
                edu.education_level, edu.institution, edu.program, edu.skills, edu.previous_experience
            FROM users u
            LEFT JOIN roles r        ON u.role_id = r.id
            LEFT JOIN departments d  ON u.department_id = d.id
            LEFT JOIN user_detail ud ON ud.user_id = u.id
            LEFT JOIN emp_info ei    ON ei.user_id = u.id AND ei.id = (SELECT MAX(id) FROM emp_info WHERE user_id = u.id)
            LEFT JOIN job_positions jp ON ei.position_id = jp.id
            LEFT JOIN education_info edu ON edu.user_id = u.id AND edu.id = (SELECT MAX(id) FROM education_info WHERE user_id = u.id)
            WHERE u.id = ?
            `,
      [id],
    );
    return rows[0];
  }

  async findByUsernameOrEmail(username: string, email: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email],
    );
    return rows[0];
  }

  async findRoleByName(roleName: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM roles WHERE role_name = ?",
      [roleName],
    );
    return rows[0];
  }

  async create(user: any, hashedPassword: string, roleId: number | null) {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO users 
             (username, password, first_name, last_name, email, phone, role_id, department_id, prefix, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        user.username,
        hashedPassword,
        user.firstName,
        user.lastName,
        user.email,
        user.phone,
        roleId,
        user.departmentId,
        user.prefix,
      ],
    );
    return result.insertId;
  }

  async logAction(
    userId: number,
    action: string,
    details: string,
    ip?: string,
    severity: "Info" | "Warning" | "Critical" = "Info",
    target?: string,
    changeRequestId?: number,
  ) {
    await pool.query(
      `INSERT INTO user_logs (user_id, action, details, ip_address, severity, target, change_request_id, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        action,
        details,
        ip || null,
        severity || "Info",
        target || null,
        changeRequestId || null,
      ],
    );
  }

  async findAllLogs(params: LogFilterParams) {
    const { search, action, startDate, endDate, limit, offset } = params;

    console.log(
      ">>> findAllLogs Called with params:",
      JSON.stringify(params, null, 2),
    );

    const filters: string[] = [];
    const queryParams: any[] = [];

    if (search) {
      const like = `%${search}%`;
      filters.push(
        `(u.first_name LIKE ? OR u.last_name LIKE ? OR u.username LIKE ? OR ul.action LIKE ? OR ul.details LIKE ? OR ul.target LIKE ?)`,
      );
      queryParams.push(like, like, like, like, like, like);
    }

    if (action && action !== "all") {
      filters.push(`ul.action = ?`);
      queryParams.push(action);
    }

    if (startDate) {
      filters.push(`ul.created_at >= ?`);
      queryParams.push(`${startDate} 00:00:00`);
    }

    if (endDate) {
      filters.push(`ul.created_at <= ?`);
      queryParams.push(`${endDate} 23:59:59`);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    // Query to fetch logs with user details
    const [rows] = await pool.query<RowDataPacket[]>(
      `
            SELECT 
                ul.*,
                u.username, u.first_name, u.last_name, u.email,
                ei.emp_code
            FROM user_logs ul
            LEFT JOIN users u ON ul.user_id = u.id
            LEFT JOIN emp_info ei ON u.id = ei.user_id AND ei.id = (SELECT MAX(id) FROM emp_info WHERE user_id = u.id)
            ${where}
            ORDER BY ul.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
            `,
      queryParams,
    );

    // Count total for pagination
    const [countRows] = await pool.query<RowDataPacket[]>(
      `
            SELECT COUNT(*) as total
            FROM user_logs ul
            LEFT JOIN users u ON ul.user_id = u.id
            ${where}
            `,
      queryParams,
    );

    const total = countRows[0]?.total ?? 0;

    return { rows, total };
  }

  async delete(id: string) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [user] = await connection.query<RowDataPacket[]>(
        "SELECT username FROM users WHERE id = ?",
        [id],
      );
      if (user.length === 0) {
        await connection.rollback();
        return false; // User not found
      }

      await connection.query("DELETE FROM user_sessions WHERE user_id = ?", [
        id,
      ]);
      await connection.query("DELETE FROM user_logs WHERE user_id = ?", [id]);
      await connection.query("DELETE FROM education_info WHERE user_id = ?", [
        id,
      ]);
      await connection.query("DELETE FROM emp_info WHERE user_id = ?", [id]);
      await connection.query("DELETE FROM user_detail WHERE user_id = ?", [id]);
      await connection.query("DELETE FROM users WHERE id = ?", [id]);

      await connection.commit();
      return true;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  async update(id: string, data: any) {
    // Only update fields that are provided
    // We focus on first_name, last_name, email as requested
    const fields = [];
    const values = [];

    if (data.firstName !== undefined) {
      fields.push("first_name = ?");
      values.push(data.firstName);
    }
    if (data.lastName !== undefined) {
      fields.push("last_name = ?");
      values.push(data.lastName);
    }
    if (data.email !== undefined) {
      fields.push("email = ?");
      values.push(data.email);
    }
    if (data.role_id !== undefined) {
      fields.push("role_id = ?");
      values.push(data.role_id);
    }
    if (data.department_id !== undefined) {
      fields.push("department_id = ?");
      values.push(data.department_id);
    }
    if (data.status !== undefined) {
      fields.push("status = ?");
      values.push(data.status);
    }

    // If no fields to update, return early
    if (fields.length === 0) return true;

    values.push(id);

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    return result.affectedRows > 0;
  }

  async bulkUpdate(ids: (string | number)[], data: any) {
    if (!ids.length) return false;

    const fields = [];
    const values = [];

    if (data.department_id !== undefined) {
      fields.push("department_id = ?");
      values.push(data.department_id);
    }
    if (data.role_id !== undefined) {
      fields.push("role_id = ?");
      values.push(data.role_id);
    }
    if (data.status !== undefined) {
      fields.push("status = ?");
      values.push(data.status);
    }

    if (fields.length === 0) return true;

    // Append IDs at the end
    values.push(...ids);

    const idPlaceholders = ids.map(() => "?").join(",");

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE users SET ${fields.join(", ")} WHERE id IN (${idPlaceholders})`,
      values,
    );

    return result.affectedRows > 0;
  }

  async resetPassword(id: string | number, hashedPassword: string) {
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, id],
    );
    return result.affectedRows > 0;
  }

  async updateStatus(id: string | number, status: string) {
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE users SET status = ? WHERE id = ?",
      [status, id],
    );
    return result.affectedRows > 0;
  }

  async updateJobPosition(userId: string | number, position: string) {
    // Update the latest emp_info record for the user
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM emp_info WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [userId],
    );

    if (rows.length > 0) {
      const empInfoId = rows[0].id;
      const [result] = await pool.query<ResultSetHeader>(
        "UPDATE emp_info SET position_id = ? WHERE id = ?",
        [position, empInfoId],
      );
      return result.affectedRows > 0;
    }
    return false;
  }
}

export default new UserRepository();
