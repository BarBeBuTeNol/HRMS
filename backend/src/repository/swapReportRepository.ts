import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

class SwapReportRepository {
    async getSwapList(dateFilter: string, departmentId: string | undefined, params: any[]) {
        let sql = `
          SELECT 
            sa.id, 
            sa.shift_date, 
            sa.shift_type, 
            sa.note, 
            sa.created_at,
            users_leave.first_name AS leave_emp_first,
            users_leave.last_name AS leave_emp_last,
            users_delegate.first_name AS delegate_emp_first,
            users_delegate.last_name AS delegate_emp_last,
            dept.department_name,
            -- Mocking status columns if they don't exist yet
            'Approved' as status, 
            IFNULL(sa.note, '') as reason,
            0 as hr_acknowledged
          FROM shift_assignments sa
          JOIN users users_leave ON sa.leave_emp_id = users_leave.id
          JOIN users users_delegate ON sa.delegate_emp_id = users_delegate.id
          LEFT JOIN departments dept ON users_leave.department_id = dept.id
          WHERE 1=1
        `;

        if (dateFilter) {
            sql += dateFilter + " ";
        }
        if (departmentId) {
            sql += " AND users_leave.department_id = ? ";
        }
        
        sql += " ORDER BY sa.shift_date DESC";

        const [rows] = await pool.query<RowDataPacket[]>(sql, params);
        return rows;
    }

    async getTopSwappers() {
        const [rows] = await pool.query<RowDataPacket[]>(`
          SELECT CONCAT(u.first_name, ' ', u.last_name) as name, COUNT(*) as count 
          FROM shift_assignments sa
          JOIN users u ON sa.leave_emp_id = u.id
          GROUP BY sa.leave_emp_id
          ORDER BY count DESC LIMIT 5
        `);
        return rows;
    }

    async getTopHelpers() {
        const [rows] = await pool.query<RowDataPacket[]>(`
          SELECT CONCAT(u.first_name, ' ', u.last_name) as name, COUNT(*) as count 
          FROM shift_assignments sa
          JOIN users u ON sa.delegate_emp_id = u.id
          GROUP BY sa.delegate_emp_id
          ORDER BY count DESC LIMIT 5
        `);
        return rows;
    }

    async getDepartmentHeatmap() {
        const [rows] = await pool.query<RowDataPacket[]>(`
          SELECT d.department_name, COUNT(*) as count
          FROM shift_assignments sa
          JOIN users u ON sa.leave_emp_id = u.id
          JOIN departments d ON u.department_id = d.id
          GROUP BY d.id
        `);
        return rows;
    }

    async getSwapVolume() {
        const [rows] = await pool.query<RowDataPacket[]>(`
          SELECT DATE_FORMAT(shift_date, '%Y-%m') as month, COUNT(*) as count
          FROM shift_assignments
          GROUP BY month
          ORDER BY month ASC LIMIT 12
        `);
        return rows;
    }
}

export default new SwapReportRepository();
