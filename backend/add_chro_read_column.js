const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hrms_db'
};

async function migrate() {
    let connection;
    try {
        console.log("Connecting to database...");
        connection = await mysql.createConnection(dbConfig);
        console.log("Connected.");

        // Check if column exists
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'leave_requests' AND COLUMN_NAME = 'chro_read'
        `, [dbConfig.database]);

        if (columns.length > 0) {
            console.log("Column 'chro_read' already exists.");
        } else {
            console.log("Adding column 'chro_read'...");
            await connection.query(`
                ALTER TABLE leave_requests 
                ADD COLUMN chro_read BOOLEAN DEFAULT FALSE
            `);
            console.log("Column 'chro_read' added successfully.");
        }
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
