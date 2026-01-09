import { Request, Response } from 'express';
import pool from '../config/db';

// ดึงแจ้งเตือนของ user
export const getNotifications = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// mark ว่าอ่านแล้ว
export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    res.json({ message: 'อ่านแล้ว' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ส่งแจ้งเตือน (All / Department)
export const sendNotification = async (req: Request, res: Response) => {
  const { title, message, target, departmentId, postedBy, referenceId, priority } = req.body;
  
  // Default sender if not provided (e.g. System Admin ID 1)
  const senderId = postedBy || 1;
  const annPriority = priority || 'Normal';

  try {
    let recipients: any[] = []; // Define recipients in outer scope
    
    // 1. Create Announcement (Always create one to generate Reference ID)
    // Fix: Save target_department_id if valid
    const targetDeptId = (target === 'department' && departmentId) ? departmentId : null;

    const [result]: any = await pool.query(
      'INSERT INTO announcements (title, content, posted_by, target_department_id, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [title, message, senderId, targetDeptId, annPriority]
    );
    
    const announcementId = result.insertId; // This is the Auto-Generated ID (Step 2)

    if (target === 'all') {
      // 2. Get All Users
      const [users] = await pool.query('SELECT id FROM users');
      recipients = users as any[];

    } else if (target === 'department' && departmentId) {
      // Get Users in Department
      const [users] = await pool.query('SELECT id FROM users WHERE department_id = ?', [departmentId]);
      recipients = users as any[];
    }

    // 3. Bulk Insert Notifications
    if (recipients.length > 0) {
      // Prepare bulk values: [user_id, message, is_read, created_at, reference_id]
      // Use the announcementId as the reference_id (Step 3)

      // We still combine Title + Message for the immediate notification text if needed, 
      // but simpler is often better. Let's keep the Title prefix for clarity.
      const fullMessage = title ? `[${title}] ${message}` : message;
      
      const values = recipients.map((u: any) => [u.id, fullMessage, 0, new Date(), announcementId]);
      
      // Assuming 'reference_id' column exists in notifications table based on user request ("Step 3 ... put into reference_id")
      // If not, this query will fail. But we must follow the specific logic flow requested.
      await pool.query(
        'INSERT INTO notifications (user_id, message, is_read, created_at, reference_id) VALUES ?',
        [values]
      );
    }

    res.json({ success: true, count: recipients.length, message: `Sent to ${recipients.length} users`, referenceId: announcementId });

  } catch (err: any) {
    console.error("Error sending notification:", err);
    res.status(500).json({ message: "Failed to send notification", error: err.message });
  }
};
