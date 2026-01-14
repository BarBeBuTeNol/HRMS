import db from './backend/src/config/db.js';
const pool = (db as any).default || db;

async function migrate() {
    console.log('Starting migration...');
    const connection = await pool.getConnection();
    try {
        await connection.query(`
            ALTER TABLE user_logs
            ADD COLUMN ip_address VARCHAR(45) NULL,
            ADD COLUMN severity VARCHAR(20) DEFAULT 'Info',
            ADD COLUMN target VARCHAR(100) NULL,
            ADD COLUMN change_request_id INT NULL
        `);
        console.log('Migration successful: Columns added to user_logs.');
    } catch (err: any) {
        if (err.code === 'ER_DUP_FIELDNAME') {
             console.log('Columns already exist. Skipping.');
        } else {
            console.error('Migration failed:', err);
        }
    } finally {
        connection.release();
        process.exit(0);
    }
}

migrate();
