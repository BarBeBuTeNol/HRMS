import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import { DbUser } from "../types";

class AuthRepository {
    async findUserByCredentials(username: string): Promise<DbUser | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT id, prefix_id, username, password, first_name, last_name, email, phone, role_id, department_id
            FROM users
            WHERE username = ?
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
