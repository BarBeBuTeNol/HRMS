import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

class JobPositionRepository {
    async getAllJobPositions() {
        const [rows] = await pool.query<RowDataPacket[]>(
            "SELECT id, position_name, department_id FROM job_positions"
        );
        return rows;
    }
}

export default new JobPositionRepository();
