import { Request, Response } from 'express';
import notificationRepository from '../repository/notificationRepository';

// ดึงแจ้งเตือนของ user
export const getNotifications = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const rows = await notificationRepository.findByUserId(userId);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// mark ว่าอ่านแล้ว
export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await notificationRepository.markAsRead(id);
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
    let recipients: any[] = []; 
    
    // 1. Create Announcement (Always create one to generate Reference ID)
    const targetDeptId = (target === 'department' && departmentId) ? departmentId : null;

    const announcementId = await notificationRepository.createAnnouncement(req.body, senderId, targetDeptId, annPriority);
    
    if (target === 'all') {
      // 2. Get All Users
      recipients = await notificationRepository.findAllUserIds();

    } else if (target === 'department' && departmentId) {
      // Get Users in Department
      recipients = await notificationRepository.findUserIdsByDepartment(departmentId);
    }

    // 3. Bulk Insert Notifications
    if (recipients.length > 0) {
      // Prepare bulk values: [user_id, message, is_read, created_at, reference_id]
      const fullMessage = title ? `[${title}] ${message}` : message;
      
      const values = recipients.map((u: any) => [u.id, fullMessage, 0, new Date(), announcementId]);
      
      await notificationRepository.createBulkNotifications(values);
    }

    res.json({ success: true, count: recipients.length, message: `Sent to ${recipients.length} users`, referenceId: announcementId });

  } catch (err: any) {
    console.error("Error sending notification:", err);
    res.status(500).json({ message: "Failed to send notification", error: err.message });
  }
};
