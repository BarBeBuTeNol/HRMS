import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

class NotificationRepository {
    async findByUserId(userId: string) {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return rows;
    }

    async markAsRead(id: string) {
        await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    }

    // Extended method for logging
    async markAsReadWithLog(id: string, ipAddress: string) {
        // 1. Get Notification Owner & Details
        const [rows] = await pool.query<RowDataPacket[]>('SELECT user_id, message, type FROM notifications WHERE id = ?', [id]);
        if (rows.length === 0) return; 

        const notif = rows[0];

        // 2. Update Status
        await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);

        // 3. Log Activity
        // Schema: user_id, action, details, ip_address
        const details = `Read notification (${notif.type || 'System'}): ${notif.message ? notif.message.substring(0, 100) : 'No Content'}`;
        
        await pool.query(
            'INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
            [notif.user_id, 'READ_NOTIFICATION', details, ipAddress]
        );
    }

    // Helper for sendNotification to create announcement
    async createAnnouncement(data: any, postedBy: number, targetDepartmentId: number | null, priority: string) {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO announcements (title, content, posted_by, target_department_id, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
            [data.title, data.message, postedBy, targetDepartmentId, priority]
        );
        return result.insertId;
    }

    async findAllUserIds() {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT id FROM users');
        return rows;
    }

    async findUserIdsByDepartment(departmentId: number) {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE department_id = ?', [departmentId]);
        return rows;
    }

    async createBulkNotifications(values: any[]) {
        await pool.query(
            'INSERT INTO notifications (user_id, message, is_read, created_at, reference_id, type) VALUES ?',
            [values]
        );
    }
}

export default new NotificationRepository();
