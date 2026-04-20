import pool from "../config/db";
import { RowDataPacket } from "mysql2";
import { DbUser } from "../types";

class AuthRepository {
  async findUserByCredentials(username: string): Promise<DbUser | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
            SELECT u.id, u.prefix_id, u.username, u.password, u.first_name, u.last_name, u.email, u.phone, u.role_id, u.department_id, r.role_name, d.name AS department, ud.profile_image_url, u.failed_login_attempts, u.locked_until
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN user_detail ud ON u.id = ud.user_id
            WHERE u.username = ?
            LIMIT 1
            `,
      [username],
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as DbUser;
  }

  async incrementFailedAttempts(userId: number): Promise<void> {
    await pool.query(
      `UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?`,
      [userId]
    );
  }

  async lockAccount(userId: number, minutes: number): Promise<void> {
    await pool.query(
      `UPDATE users SET locked_until = DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE id = ?`,
      [minutes, userId]
    );
  }

  async resetFailedAttempts(userId: number): Promise<void> {
    await pool.query(
      `UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?`,
      [userId]
    );
  }
}

export default new AuthRepository();
