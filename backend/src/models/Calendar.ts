export interface CalendarEvent {
    id?: number;
    date: string; // YYYY-MM-DD
    title: string;
    description?: string;
    type: 'holiday' | 'event' | 'meeting' | 'training' | 'company event';
    endDate?: string;
    isAllDay?: boolean;
    createdBy?: number;
    created_at?: Date;
}
