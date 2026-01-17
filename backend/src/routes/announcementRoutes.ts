import { Router } from 'express';
import { getAnnouncements, createAnnouncement, deleteAnnouncement, updateAnnouncement, markRead } from '../controllers/announcementController';

const router = Router();

router.get('/', getAnnouncements);
router.post('/', createAnnouncement);
router.delete('/:id', deleteAnnouncement);
router.put('/:id', updateAnnouncement);
router.put('/:id/read', markRead);

export default router;
