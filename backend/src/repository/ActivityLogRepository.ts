import pool from "../config/db";
import { RowDataPacket } from "mysql2";

class ActivityLogRepository {
  async logActivity(data: {
    user_id: number;
    action: string;
    details?: string;
    ip_address?: string;
  }) {
    const { user_id, action, details, ip_address } = data;
    try {
      // Check if table exists (optional, but good for safety if we can't run migrations)
      // For now, we assume it exists or we handle the error.
      // We will actually just try to insert.
      
      const [result] = await pool.query(
        `INSERT INTO activity_logs (user_id, action, details, ip_address, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [user_id, action, details || null, ip_address || null]
      );
      return result;
    } catch (error) {
        // If table doesn't exist, we might want to create it?
        // But for now, just log error
        console.error("Failed to log activity:", error);
        return null; 
    }
  }

  async getLogs(deptId: number) {
      // Example retrieval
      const [logs] = await pool.query<RowDataPacket[]>(`
        SELECT al.*, u.first_name, u.last_name 
        FROM activity_logs al
        JOIN users u ON al.user_id = u.id
        WHERE u.department_id = ?
        ORDER BY al.created_at DESC LIMIT 50
      `, [deptId]);
      return logs;
  }
}

export default new ActivityLogRepository();
