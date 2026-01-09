import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

class ChroRepository {
    async getTotalEmployees() {
        const [rows] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) as count FROM users");
        return rows[0].count;
    }

    async getActiveEmployees() {
        const [rows] = await pool.query<RowDataPacket[]>(
            "SELECT COUNT(DISTINCT user_id) as count FROM user_sessions WHERE last_activity >= NOW() - INTERVAL 15 MINUTE"
        );
        return rows[0].count;
    }

    async getDepartmentStats() {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT d.id, d.department_name as name, COUNT(u.id) as count, SUM(ei.salary) as budget
             FROM departments d
             LEFT JOIN users u ON d.id = u.department_id
             LEFT JOIN emp_info ei ON u.id = ei.user_id
             GROUP BY d.id`
        );
        return rows;
    }

    async getGenderDistribution() {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT ud.gender, COUNT(*) as count 
             FROM user_detail ud 
             JOIN users u ON ud.user_id = u.id
             GROUP BY ud.gender`
        );
        return rows;
    }

    async getAverageSalary() {
        const [rows] = await pool.query<RowDataPacket[]>("SELECT AVG(salary) as avg_salary FROM emp_info");
        return parseFloat(rows[0].avg_salary || 0);
    }

    async getRecentActivities() {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT id, action as message, created_at as time, 'info' as type 
             FROM user_logs 
             ORDER BY id DESC 
             LIMIT 5`
        );
        return rows;
    }
}

export default new ChroRepository();
