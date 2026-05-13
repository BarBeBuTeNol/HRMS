import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../config/db'; // Correct default import
import { CalendarEvent } from '../models/Calendar';

export class CalendarRepository {
    static async getAllEvents(): Promise<CalendarEvent[]> {
        // Fetch All Events from 'holiday_calendar'
        const [events] = await db.query<RowDataPacket[]>('SELECT * FROM holiday_calendar ORDER BY start_date ASC');

        // Map to CalendarEvent format
        const formattedEvents = events.map((h: any) => {
            let type = 'event';
            const dbType = (h.event_type || '').toLowerCase();
            if (dbType.includes('holiday')) type = 'holiday';
            else if (dbType.includes('meeting')) type = 'meeting';
            else type = 'event';

            return {
                id: h.id,
                title: h.event_name,
                date: h.start_date,
                description: h.description || '',
                type
            };
        });

        return formattedEvents as CalendarEvent[];
    }

    static async addEvent(event: CalendarEvent): Promise<number> {
        const { date, endDate, title, description, type, isAllDay, createdBy } = event;
        
        // Map frontend types to DB ENUM values
        let dbType = 'Company Event';
        if (type === 'holiday') dbType = 'Holiday';
        else if (type === 'meeting') dbType = 'Meeting';
        else if (type === 'event') dbType = 'Company Event';

        const [result] = await db.execute<ResultSetHeader>(
            'INSERT INTO holiday_calendar (start_date, end_date, event_name, description, event_type, is_all_day, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
            [
                date, 
                endDate || date, 
                title, 
                description, 
                dbType,
                isAllDay ? 1 : 0,
                createdBy || 1
            ]
        );
        return result.insertId;
    }

    static async deleteEvent(id: number): Promise<void> {
        await db.execute('DELETE FROM holiday_calendar WHERE id = ?', [id]);
    }
}
