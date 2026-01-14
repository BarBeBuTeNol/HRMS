import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

class AnnouncementRepository {
    async findAll(userId?: string) {
        let query = `
            SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) as poster_name, d.department_name
            FROM announcements a
            LEFT JOIN users u ON a.posted_by = u.id
            LEFT JOIN departments d ON a.target_department_id = d.id
        `;
        
        if (userId) {
            query = `
                SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) as poster_name, d.department_name,
                CASE WHEN n.id IS NOT NULL AND n.is_read = 1 THEN 1 ELSE 0 END as is_read
                FROM announcements a
                LEFT JOIN users u ON a.posted_by = u.id
                LEFT JOIN departments d ON a.target_department_id = d.id
                LEFT JOIN notifications n ON n.reference_id = a.id AND n.user_id = ${pool.escape(userId)}
            `;
        }
        
        query += ` ORDER BY a.created_at DESC`;

        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows;
    }

    async getFirstUser() {
        const [rows] = await pool.query<RowDataPacket[]>("SELECT id FROM users LIMIT 1");
        return rows[0];
    }

    async create(title: string, content: string, postedBy: number, targetDepartmentId: number | null, priority: string = 'Normal') {
        const [result] = await pool.query<ResultSetHeader>(`
            INSERT INTO announcements (title, content, posted_by, target_department_id, priority, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `, [title, content, postedBy, targetDepartmentId, priority]);
        return result;
    }

    async delete(id: string) {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM announcements WHERE id = ?', [id]);
        return result;
    }

    async update(id: string, title: string, content: string) {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE announcements SET title = ?, content = ?, updated_at = NOW() WHERE id = ?',
            [title, content, id]
        );
        return result;
    }

    async findNotification(userId: string, referenceId: string) {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM notifications WHERE user_id = ? AND reference_id = ?',
            [userId, referenceId]
        );
        return rows[0];
    }

    async updateNotificationReadStatus(id: number) {
        await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    }

    async findById(id: string) {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT title, posted_by FROM announcements WHERE id = ?', [id]);
        return rows[0];
    }

    async createReadNotification(userId: string, message: string, referenceId: string) {
        await pool.query(
            'INSERT INTO notifications (user_id, message, is_read, created_at, reference_id) VALUES (?, ?, 1, NOW(), ?)',
            [userId, message, referenceId]
        );
    }
}

export default new AnnouncementRepository();
