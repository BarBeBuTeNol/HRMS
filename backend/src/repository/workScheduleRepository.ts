import db from "../config/db";
import { ResultSetHeader } from "mysql2";

class WorkScheduleRepository {
  async bulkUpsertSchedules(schedules: any[]) {
    for (const item of schedules) {
      const { user_id, date, shift, department_id } = item;

      await db.query(
        `REPLACE INTO work_schedules (user_id, work_date, shift, department_id)
                 VALUES (?, ?, ?, ?)`,
        [user_id, date, shift, department_id],
      );
    }
  }

  // New method to find schedules by date range for a user
  async findSchedulesByRange(
    userId: string,
    startDate: string,
    endDate: string,
  ) {
    const [rows] = await db.query<ResultSetHeader[]>( // Cast to correct type if needed, usually RowDataPacket[]
      `SELECT * FROM work_schedules 
             WHERE user_id = ? 
             AND work_date BETWEEN ? AND ?`,
      [userId, startDate, endDate],
    );
    return rows;
  }

  async updateScheduleStatus(
    userId: string | number,
    date: string,
    status: string,
    leaveRequestId: number,
  ) {
    // Check if schedule exists
    const [rows] = await db.query<any[]>(
      `SELECT id FROM work_schedules WHERE user_id = ? AND work_date = ?`,
      [userId, date],
    );

    if (rows.length > 0) {
      if (status === "Day Off") {
        await db.query(
          `UPDATE work_schedules SET shift = 'Full-day', status = 'Day Off', leave_request_id = ? WHERE user_id = ? AND work_date = ?`,
          [leaveRequestId, userId, date],
        );
      } else {
        await db.query(
          `UPDATE work_schedules SET shift = ?, leave_request_id = ? WHERE user_id = ? AND work_date = ?`,
          [status, leaveRequestId, userId, date],
        );
      }
    } else {
      // Insert new schedule using user's department
      if (status === "Day Off") {
        await db.query(
          `INSERT INTO work_schedules (user_id, work_date, shift, status, department_id, leave_request_id)
           SELECT ?, ?, 'Full-day', 'Day Off', department_id, ? FROM users WHERE id = ?`,
          [userId, date, leaveRequestId, userId],
        );
      } else {
        await db.query(
          `INSERT INTO work_schedules (user_id, work_date, shift, department_id, leave_request_id)
           SELECT ?, ?, ?, department_id, ? FROM users WHERE id = ?`,
          [userId, date, status, leaveRequestId, userId],
        );
      }
    }
  }
}

export default new WorkScheduleRepository();
