export interface CalendarEvent {
    id?: number;
    date: string; // YYYY-MM-DD
    title: string;
    description?: string;
    type: 'holiday' | 'event' | 'meeting';
    created_at?: Date;
}
