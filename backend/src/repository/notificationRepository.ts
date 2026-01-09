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
            'INSERT INTO notifications (user_id, message, is_read, created_at, reference_id) VALUES ?',
            [values]
        );
    }
}

export default new NotificationRepository();
