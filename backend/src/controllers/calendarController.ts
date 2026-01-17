import { Request, Response } from 'express';
import { CalendarRepository } from '../repository/calendarRepository';

export const getCalendarEvents = async (req: Request, res: Response) => {
    try {
        const events = await CalendarRepository.getAllEvents();
        res.json(events);
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const addCalendarEvent = async (req: Request, res: Response) => {
    try {
        const { date, title, description, type } = req.body;
        if (!date || !title) {
             res.status(400).json({ message: 'Date and Title are required' });
             return;
        }

        const newEventId = await CalendarRepository.addEvent({ date, title, description, type: type || 'holiday' });
        res.status(201).json({ message: 'Event added successfully', id: newEventId });
    } catch (error) {
        console.error('Error adding calendar event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteCalendarEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await CalendarRepository.deleteEvent(Number(id));
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
