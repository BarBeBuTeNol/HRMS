import { Router } from 'express';
import { getAnnouncements, deleteAnnouncement, updateAnnouncement, markRead } from '../controllers/announcementController';

const router = Router();

router.get('/', getAnnouncements);
router.delete('/:id', deleteAnnouncement);
router.put('/:id', updateAnnouncement);
router.put('/:id/read', markRead);

export default router;
