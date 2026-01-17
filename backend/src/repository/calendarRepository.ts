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
        const { date, title, description, type } = event;
        const [result] = await db.execute<ResultSetHeader>(
            'INSERT INTO holiday_calendar (start_date, event_name, description, event_type, created_at) VALUES (?, ?, ?, ?, NOW())',
            [date, title, description, type === 'holiday' ? 'Holiday' : 'Company Event']
        );
        return result.insertId;
    }

    static async deleteEvent(id: number): Promise<void> {
        await db.execute('DELETE FROM holiday_calendar WHERE id = ?', [id]);
    }
}
