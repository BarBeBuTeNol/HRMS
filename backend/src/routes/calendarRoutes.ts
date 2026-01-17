import { Router } from 'express';
import { getCalendarEvents, addCalendarEvent, deleteCalendarEvent } from '../controllers/calendarController';

const router = Router();

router.get('/', getCalendarEvents);
router.post('/', addCalendarEvent);
router.delete('/:id', deleteCalendarEvent);

export default router;
