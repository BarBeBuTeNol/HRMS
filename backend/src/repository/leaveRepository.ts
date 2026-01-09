import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

class LeaveRepository {
    async createLeaveRequest(data: any) {
        const { user_id, leave_type, start_date, end_date, reason } = data;
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)',
            [user_id, leave_type, start_date, end_date, reason]
        );
        return result.insertId;
    }

    async findAll() {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM leave_requests ORDER BY created_at DESC');
        return rows;
    }

    async findByUserId(userId: string) {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM leave_requests WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        return rows;
    }

    // Helper to get employee info for leave request logic
    async findEmployeeWithDepartment(userId: string) {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT u.id, u.first_name, u.last_name, u.department_id, d.department_name
             FROM users u
             LEFT JOIN departments d ON u.department_id = d.id
             WHERE u.id = ?`,
            [userId]
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
            [departmentId]
        );
        return rows[0];
    }

    async createNotification(userId: number, type: string, title: string, details: string) {
        await pool.query(
            'INSERT INTO notifications (user_id, type, title, details) VALUES (?, ?, ?, ?)',
            [userId, type, title, details]
        );
    }
}

export default new LeaveRepository();
