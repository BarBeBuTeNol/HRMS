import { Request, Response } from 'express';
import announcementRepository from '../repository/announcementRepository';
import { logUserAction } from '../utils/activityLogger';

// Get all announcements
export const getAnnouncements = async (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    try {
        const rows = await announcementRepository.findAll(userId);

        // OPTIONAL: If no announcements, seed one for demo purposes
        if (rows.length === 0) {
           const user = await announcementRepository.getFirstUser();
           if (user) {
               await announcementRepository.create(
                   'Welcome to the new HR System',
                   'We are excited to launch the new HR Management System. Please update your profile.',
                   user.id,
                   null,
                   'Important'
               );
               
               // Re-fetch (simple)
               const newRows = await announcementRepository.findAll(userId);
               return res.json(newRows);
           }
        }

        res.json(rows);
    } catch (error: any) {
        console.error("Error fetching announcements:", error);
        res.status(500).json({ message: "Error fetching announcements", error: error.message });
    }
};

// Create announcement
export const createAnnouncement = async (req: Request, res: Response) => {
    const { title, content, userId, type, targetDepartmentId, priority } = req.body;
    try {
        const deptId = type === 'department' ? targetDepartmentId : null;
        await announcementRepository.create(title, content, userId, deptId, priority);
        
        await logUserAction(userId, "Create Announcement", `Created announcement: ${title} (${type}, ${priority})`);
        
        res.status(201).json({ message: "Announcement created successfully" });
    } catch (error: any) {
        console.error("Error creating announcement:", error);
        res.status(500).json({ message: "Error creating announcement", error: error.message });
    }
};

// Delete announcement
export const deleteAnnouncement = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId } = req.body; // Expect userId to be passed in data even for delete
    
    try {
        const ann = await announcementRepository.findById(id);
        if (!ann) return res.status(404).json({ message: "Announcement not found" });

        // Basic ownership check if userId is provided
        if (userId && Number(userId) !== ann.posted_by) {
             return res.status(403).json({ message: "Unauthorized: You can only delete your own announcements" });
        }

        await announcementRepository.delete(id);
        
        if (userId) {
            await logUserAction(userId, "Delete Announcement", `Deleted announcement ID: ${id}`);
        }
        
        res.json({ message: "Announcement deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting announcement:", error);
        res.status(500).json({ message: "Error deleting announcement", error: error.message });
    }
};


// Update announcement
export const updateAnnouncement = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, content, userId } = req.body; 
    try {
        const ann = await announcementRepository.findById(id);
        if (!ann) return res.status(404).json({ message: "Announcement not found" });

        if (userId && Number(userId) !== ann.posted_by) {
            return res.status(403).json({ message: "Unauthorized: You can only edit your own announcements" });
        }

        await announcementRepository.update(id, title, content);
        
        if (userId) {
            await logUserAction(userId, "Update Announcement", `Updated announcement: ${title}`);
        }

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
        const existing = await announcementRepository.findNotification(userId, id);

        if (existing) {
            await announcementRepository.updateNotificationReadStatus(existing.id);
        } else {
            // Get announcement title
            const ann = await announcementRepository.findById(id);
            if (ann) {
                 const message = `Read Announcement: ${ann.title}`;
                 await announcementRepository.createReadNotification(userId, message, id);
            }
        }
        res.json({ success: true });
    } catch (error: any) {
        console.error("Error marking announcement as read:", error);
        res.status(500).json({ message: "Error", error: error.message });
    }
};
