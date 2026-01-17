import db from "../config/db";
import { ResultSetHeader } from 'mysql2';

class WorkScheduleRepository {
    async bulkUpsertSchedules(schedules: any[]) {
        for (const item of schedules) {
            const { user_id, date, shift, department_id } = item;

            await db.query(
                `REPLACE INTO work_schedules (user_id, work_date, shift, department_id)
                 VALUES (?, ?, ?, ?)`,
                [user_id, date, shift, department_id]
            );
        }
    }

    // New method to find schedules by date range for a user
    async findSchedulesByRange(userId: string, startDate: string, endDate: string) {
        const [rows] = await db.query<ResultSetHeader[]>( // Cast to correct type if needed, usually RowDataPacket[]
            `SELECT * FROM work_schedules 
             WHERE user_id = ? 
             AND work_date BETWEEN ? AND ?`,
             [userId, startDate, endDate]
        );
        return rows;
    }
}

export default new WorkScheduleRepository();
