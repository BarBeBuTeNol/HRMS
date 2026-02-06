import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

class EmployeeDashboardRepository {
    // 1. Get Today's Shift
    async getTodayShift(userId: string) {
        // Schema: work_schedules (user_id, work_date, shift, status, notes...)
        const sql = `
            SELECT id, work_date, shift, status, notes as note 
            FROM work_schedules 
            WHERE user_id = ? AND work_date = CURDATE()
            LIMIT 1
        `;
        const [rows] = await pool.query<RowDataPacket[]>(sql, [userId]);
        return rows[0] || null;
    }

    // 2. Get Task Summary & Progress
    async getTaskStats(userId: string) {
        // Schema: task_assignments (user_id, status, progress...)
        const sql = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed
            FROM task_assignments
            WHERE user_id = ?
        `;
        const [rows] = await pool.query<RowDataPacket[]>(sql, [userId]);
        const stats = rows[0];
        
        const total = stats.total || 0;
        const progress = total > 0 ? (stats.completed / total) * 100 : 0;
        
        return {
            pending: stats.pending || 0,
            in_progress: stats.in_progress || 0,
            completed: stats.completed || 0,
            total,
            progress: Math.round(progress)
        };
    }

    // 3. Integrated Calendar Data (Next 30 Days)
    async getCalendarData(userId: string) {
        // Holidays & Company Events from 'holiday_calendar'
        const [holidays] = await pool.query<RowDataPacket[]>(`
            SELECT start_date as date, event_name as title, 'holiday' as type 
            FROM holiday_calendar 
            WHERE start_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        `);

        // Approved Leaves
        const [leaves] = await pool.query<RowDataPacket[]>(`
            SELECT start_date as date, leave_type as title, 'leave' as type 
            FROM leave_requests 
            WHERE user_id = ? AND status = 'Approved' 
            AND start_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        `, [userId]);

        // Task Deadlines
        const [deadlines] = await pool.query<RowDataPacket[]>(`
            SELECT deadline as date, task_name as title, 'deadline' as type 
            FROM task_assignments 
            WHERE user_id = ? 
            AND deadline BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        `, [userId]);

        return [...holidays, ...leaves, ...deadlines].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    // 4. Actionable Tasks
    async getActionableTasks(userId: string) {
        const sql = `
            SELECT id, task_name as title, deadline as due_date, status, progress 
            FROM task_assignments 
            WHERE user_id = ? 
            AND (status = 'Pending' OR (deadline BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY) AND status != 'Completed'))
            ORDER BY deadline ASC
        `;
        const [rows] = await pool.query<RowDataPacket[]>(sql, [userId]);
        return rows;
    }

    // 5. Announcements
    async getAnnouncements(userId: string) {
        // First get user department
        const [userRows] = await pool.query<RowDataPacket[]>('SELECT department_id FROM users WHERE id = ?', [userId]);
        const deptId = userRows[0]?.department_id;

        // JOIN with users table to get first_name and last_name of the poster
        const sql = `
            SELECT a.*, u.first_name, u.last_name 
            FROM announcements a
            LEFT JOIN users u ON a.posted_by = u.id
            WHERE a.target_type = 'all' 
            OR (a.target_type = 'department' AND a.target_department_id = ?)
            ORDER BY a.created_at DESC LIMIT 5
        `;
        const [rows] = await pool.query<RowDataPacket[]>(sql, [deptId]);
        return rows;
    }

    // 6. Notifications
    async getNotifications(userId: string) {
        const sql = `
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC LIMIT 5
        `;
        const [rows] = await pool.query<RowDataPacket[]>(sql, [userId]);
        return rows;
    }

    // 7. Profile Data (NEW)
    async getEmployeeProfile(userId: string) {
        const sql = `
            SELECT 
                u.first_name, 
                u.last_name, 
                u.email, 
                u.phone,
                u.role_id,
                ud.profile_image_url AS profile_pic,
                r.role_name,
                d.department_name,
                j.position_name
            FROM users u
            LEFT JOIN user_detail ud ON u.id = ud.user_id
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN emp_info ei ON u.id = ei.user_id
            LEFT JOIN job_positions j ON ei.position_id = j.id
            WHERE u.id = ?
        `;
        const [rows] = await pool.query<RowDataPacket[]>(sql, [userId]);
        return rows[0] || null;
    }
}

export default new EmployeeDashboardRepository();
