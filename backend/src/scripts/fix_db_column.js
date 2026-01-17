
const mysql = require('mysql2/promise');
require('dotenv').config();

// Try to load config from .env, else fallback to common defaults
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hrms_db',
    port: process.env.DB_PORT || 3306
};

async function fixColumn() {
    let connection;
    try {
        console.log('Connecting to database:', dbConfig.host, dbConfig.user, dbConfig.database);
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected.');

        // 1. Check if column exists
        console.log('Checking columns in leave_requests...');
        const [columns] = await connection.query("SHOW COLUMNS FROM leave_requests LIKE 'rejection_reason'");
        
        if (columns.length > 0) {
            console.log('Column rejection_reason ALREADY EXISTS.');
        } else {
            console.log('Column missing. Adding it now...');
            await connection.query("ALTER TABLE leave_requests ADD COLUMN rejection_reason TEXT");
            console.log('Column added successfully.');
        }

        // 2. Add chro_read if missing (just in case)
        const [readCols] = await connection.query("SHOW COLUMNS FROM leave_requests LIKE 'chro_read'");
        if (readCols.length === 0) {
             console.log('Adding chro_read column...');
             await connection.query("ALTER TABLE leave_requests ADD COLUMN chro_read BOOLEAN DEFAULT 0");
        }

        console.log('Verification:');
        const [finalCols] = await connection.query("SHOW COLUMNS FROM leave_requests");
        console.log('Current Columns:', finalCols.map(c => c.Field).join(', '));

    } catch (error) {
        console.error('FATAL ERROR:', error);
    } finally {
        if (connection) await connection.end();
    }
}

fixColumn();
