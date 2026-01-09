import { Request, Response } from 'express';
import pool from '../config/db';

// Get all announcements
export const getAnnouncements = async (req: Request, res: Response) => {
    const userId = req.query.userId;
    try {
        let query = `
            SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) as poster_name, d.department_name
            FROM announcements a
            LEFT JOIN users u ON a.posted_by = u.id
            LEFT JOIN departments d ON a.target_department_id = d.id
        `;
        
        // If userId is provided, check read status
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

        const [rows]: any = await pool.query(query);

        // OPTIONAL: If no announcements, seed one for demo purposes
        if (rows.length === 0) {
           const [userExists]: any = await pool.query("SELECT id FROM users LIMIT 1");
           if (userExists.length > 0) {
               const uid = userExists[0].id;
               await pool.query(`
                   INSERT INTO announcements (title, content, posted_by, priority, created_at, updated_at)
                   VALUES ('Welcome to the new HR System', 'We are excited to launch the new HR Management System. Please update your profile.', ?, 'Important', NOW(), NOW())
               `, [uid]);
               
               // Re-fetch (simple)
               return getAnnouncements(req, res);
           }
        }

        res.json(rows);
    } catch (error: any) {
        console.error("Error fetching announcements:", error);
        res.status(500).json({ message: "Error fetching announcements", error: error.message });
    }
};

// Delete announcement
export const deleteAnnouncement = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
        res.json({ message: "Announcement deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting announcement:", error);
        res.status(500).json({ message: "Error deleting announcement", error: error.message });
    }
};


// Update announcement
export const updateAnnouncement = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, content } = req.body;
    try {
        await pool.query(
            'UPDATE announcements SET title = ?, content = ?, updated_at = NOW() WHERE id = ?',
            [title, content, id]
        );
        res.json({ message: "Announcement updated successfully" });
    } catch (error: any) {
        console.error("Error updating announcement:", error);
        res.status(500).json({ message: "Error updating announcement", error: error.message });
    }
};

// Mark announcement as read
export const markRead = async (req: Request, res: Response) => {
    const { id } = req.params; // announcement id
    const { userId } = req.body; 

    try {
        // Check if notification exists
        const [existing]: any = await pool.query(
            'SELECT id FROM notifications WHERE user_id = ? AND reference_id = ?',
            [userId, id]
        );

        if (existing.length > 0) {
            await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [existing[0].id]);
        } else {
            // Get announcement title
            const [ann]: any = await pool.query('SELECT title FROM announcements WHERE id = ?', [id]);
            if (ann.length > 0) {
                 const message = `Read Announcement: ${ann[0].title}`;
                 await pool.query(
                     'INSERT INTO notifications (user_id, message, is_read, created_at, reference_id) VALUES (?, ?, 1, NOW(), ?)',
                     [userId, message, id]
                 );
            }
        }
        res.json({ success: true });
    } catch (error: any) {
        console.error("Error marking announcement as read:", error);
        res.status(500).json({ message: "Error", error: error.message });
    }
};
