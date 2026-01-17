import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import { DbUser } from "../types";

class AuthRepository {
    async findUserByCredentials(username: string): Promise<DbUser | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT u.id, u.prefix_id, u.username, u.password, u.first_name, u.last_name, u.email, u.phone, u.role_id, u.department_id, r.role_name, d.name AS department
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.username = ?
            LIMIT 1
            `,
            [username]
        );

        if (rows.length === 0) {
            return null;
        }

        return rows[0] as DbUser;
    }
}

export default new AuthRepository();
