import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

class SwapReportRepository {
    async getSwapList(dateFilter: string, departmentId: string | undefined, params: any[]) {
        let sql = `
          SELECT 
            tr.id, 
            ws.work_date as shift_date, 
            ws.shift as shift_type, 
            tr.reason as note, 
            tr.created_at,
            users_leave.first_name AS leave_emp_first,
            users_leave.last_name AS leave_emp_last,
            users_delegate.first_name AS delegate_emp_first,
            users_delegate.last_name AS delegate_emp_last,
            dept.department_name,
            tr.status, 
            IFNULL(tr.reason, '') as reason,
            0 as hr_acknowledged
          FROM task_replacements tr
          LEFT JOIN work_schedules ws ON tr.shift_id = ws.id
          JOIN users users_leave ON tr.original_user_id = users_leave.id
          JOIN users users_delegate ON tr.replacement_user_id = users_delegate.id
          LEFT JOIN departments dept ON users_leave.department_id = dept.id
          WHERE 1=1
        `;

        // Note: verify if dateFilter uses alias 'sa.shift_date' -> needs update to 'ws.work_date'
        // The controller likely passes "AND MONTH(sa.shift_date)..." so I rely on the fact that 
        // string replacement or just fixing the hardcoded parts is enough? 
        // The error log showed the date filter was Passed inside the SQL string in the controller? 
        // No, the error log showed: AND MONTH(sa.shift_date) = ... in the SQL property of the error object.
        // Wait, the controller usually constructs the `dateFilter` string.
        // If the controller constructs "AND MONTH(sa.shift_date)...", it will break if I change alias.
        // I should probably alias `ws.work_date` as `shift_date` (done above) but WHERE clause uses table alias.
        // If the controller hardcodes `sa.`, I might need to change the controller OR alias the table `tr` or `ws` to `sa`?
        // No, `sa` was `shift_assignments`. `ws` is `work_schedules`. `tr` is `task_replacements`.
        // Logical for date is `ws`.
        // If the controller passes a string like "AND MONTH(sa.shift_date)...", I MUST update the Controller too.
        // OR I can try to alias `work_schedules` as `sa` in the query to trick it, 
        // but `sa.shift_type` vs `ws.shift`... schema differences.
        // Safer to alias `work_schedules` as `sa` for date purposes? 
        // `ws.work_date` is the valid column. `sa.shift_date` was the old one.
        // If I alias `work_schedules as sa`, then `sa.work_date`? No old was `shift_date`.
        // So I must check Controller. 
        // But for now let's write standard aliases and I'll check controller next.
        // If I keep `ws`, I need to update controller.
        
        if (dateFilter) {
            // Replace old alias sa.shift_date with ws.work_date if present in dateFilter string? 
            // Better to fix controller.
            sql += dateFilter + " ";
        }
        if (departmentId) {
            sql += " AND users_leave.department_id = ? ";
        }
        
        sql += " ORDER BY ws.work_date DESC";

        const [rows] = await pool.query<RowDataPacket[]>(sql, params);
        return rows;
    }

    async getTopSwappers() {
        const [rows] = await pool.query<RowDataPacket[]>(`
          SELECT CONCAT(u.first_name, ' ', u.last_name) as name, COUNT(*) as count 
          FROM task_replacements tr
          JOIN users u ON tr.original_user_id = u.id
          GROUP BY tr.original_user_id
          ORDER BY count DESC LIMIT 5
        `);
        return rows;
    }

    async getTopHelpers() {
        const [rows] = await pool.query<RowDataPacket[]>(`
          SELECT CONCAT(u.first_name, ' ', u.last_name) as name, COUNT(*) as count 
          FROM task_replacements tr
          JOIN users u ON tr.replacement_user_id = u.id
          GROUP BY tr.replacement_user_id
          ORDER BY count DESC LIMIT 5
        `);
        return rows;
    }

    async getDepartmentHeatmap() {
        const [rows] = await pool.query<RowDataPacket[]>(`
          SELECT d.department_name, COUNT(*) as count
          FROM task_replacements tr
          JOIN users u ON tr.original_user_id = u.id
          JOIN departments d ON u.department_id = d.id
          GROUP BY d.id
        `);
        return rows;
    }

    async getSwapVolume() {
        const [rows] = await pool.query<RowDataPacket[]>(`
          SELECT DATE_FORMAT(ws.work_date, '%Y-%m') as month, COUNT(*) as count
          FROM task_replacements tr
          JOIN work_schedules ws ON tr.shift_id = ws.id
          GROUP BY month
          ORDER BY month ASC LIMIT 12
        `);
        return rows;
    }
}

export default new SwapReportRepository();
