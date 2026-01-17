
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hrms_db',
    port: process.env.DB_PORT || 3306
};

async function updateSchema() {
    let connection;
    try {
        console.log('Connecting to database...');
        try {
            connection = await mysql.createConnection(dbConfig);
        } catch (err) {
             console.log("Connect failed, trying default root/empty...");
             connection = await mysql.createConnection({
                 host: 'localhost',
                 user: 'root',
                 password: '',
                 database: 'hrms_db'
             });
        }

        console.log('Adding rejection_reason column to leave_requests...');
        try {
             await connection.query("ALTER TABLE leave_requests ADD COLUMN rejection_reason TEXT");
             console.log("Added rejection_reason column");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                 console.log("rejection_reason column already exists");
            } else {
                 throw e;
            }
        }
        
        console.log('Done.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

updateSchema();
