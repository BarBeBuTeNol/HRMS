
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hrms_db',
    port: process.env.DB_PORT || 3306
};

async function checkTables() {
    let connection;
    try {
        console.log('Connecting...');
        connection = await mysql.createConnection(dbConfig);

        // 1. user_logs
        console.log('Checking user_logs...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS user_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                action TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('user_logs OK.');

        // 2. notifications
        console.log('Checking notifications...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                type VARCHAR(50),
                title VARCHAR(255),
                details TEXT,
                is_read BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('notifications OK.');

        // 3. company_calendar
        console.log('Checking company_calendar...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS company_calendar (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATE NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                type ENUM('holiday', 'event', 'meeting') DEFAULT 'holiday',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('company_calendar OK.');
        
        console.log('All dependencies checked.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkTables();
