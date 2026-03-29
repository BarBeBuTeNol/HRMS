import pool from './config/db';
import { RowDataPacket } from 'mysql2';

async function check() {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('DESCRIBE notifications');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
