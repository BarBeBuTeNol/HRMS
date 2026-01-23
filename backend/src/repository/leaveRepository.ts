import pool from "../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

class LeaveRepository {
  async createLeaveRequest(data: any) {
    const { user_id, leave_type, start_date, end_date, reason, status } = data;
    const leaveStatus = status || "Pending";
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?, ?)",
      [user_id, leave_type, start_date, end_date, reason, leaveStatus],
    );
    return result.insertId;
  }

  async findAll() {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM leave_requests ORDER BY created_at DESC",
    );
    return rows;
  }

  async findByUserId(userId: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM leave_requests WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
    );
    return rows;
  }

  // Helper to get employee info for leave request logic
  async findEmployeeWithDepartment(userId: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.first_name, u.last_name, u.department_id, d.department_name
             FROM users u
             LEFT JOIN departments d ON u.department_id = d.id
             WHERE u.id = ?`,
      [userId],
    );
    return rows[0];
  }

  // Helper to find Head of Department
  async findHeadOfDepartment(departmentId: number) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.first_name, u.last_name
             FROM users u
             WHERE u.department_id = ? AND u.role_id = 4
             LIMIT 1`,
      [departmentId],
    );
    return rows[0];
  }

  async createNotification(
    userId: number,
    type: string,
    message: string,
    referenceId: number = 0,
  ) {
    await pool.query(
      "INSERT INTO notifications (user_id, type, message, reference_id, is_read) VALUES (?, ?, ?, ?, 0)",
      [userId, type, message, referenceId],
    );
  }
}

export default new LeaveRepository();
