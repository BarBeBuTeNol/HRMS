import db from "../config/db.js";
import { ResultSetHeader } from 'mysql2';

class WorkScheduleRepository {
    async bulkUpsertSchedules(schedules: any[]) {
        for (const item of schedules) {
            const { user_id, date, shift, department_id } = item;

            await db.query(
                `REPLACE INTO work_schedules (user_id, date, shift, department_id)
                 VALUES (?, ?, ?, ?)`,
                [user_id, date, shift, department_id]
            );
        }
    }
}

export default new WorkScheduleRepository();
