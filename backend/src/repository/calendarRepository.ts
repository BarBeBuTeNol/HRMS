import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../config/db'; // Correct default import
import { CalendarEvent } from '../models/Calendar';

export class CalendarRepository {
    static async getAllEvents(): Promise<CalendarEvent[]> {
        // Fetch All Events from 'holiday_calendar'
        const [events] = await db.query<RowDataPacket[]>('SELECT * FROM holiday_calendar ORDER BY start_date ASC');

        // Map to CalendarEvent format
        const formattedEvents = events.map((h: any) => ({
            id: h.id, // Keep as number
            title: h.event_name,
            date: h.start_date,
            description: h.description || '',
            type: h.event_type.toLowerCase().includes('holiday') ? 'holiday' : 'event'
        }));

        return formattedEvents as CalendarEvent[];
    }

    static async addEvent(event: CalendarEvent): Promise<number> {
        // Note: Using holiday_calendar as the main event table
        const { date, endDate, title, description, type, isAllDay, createdBy } = event;
        const [result] = await db.execute<ResultSetHeader>(
            'INSERT INTO holiday_calendar (start_date, end_date, event_name, description, event_type, is_all_day, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
            [
                date, 
                endDate || date, // Default to start date if not provided
                title, 
                description, 
                type,
                isAllDay ? 1 : 0,
                createdBy || 1 // Fallback to 1 if not provided (safety net)
            ]
        );
        return result.insertId;
    }

    static async deleteEvent(id: number): Promise<void> {
        await db.execute('DELETE FROM holiday_calendar WHERE id = ?', [id]);
    }
}
