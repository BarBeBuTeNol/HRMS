
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'hrms',
    port: process.env.DB_PORT || 3306
};

async function checkSchema() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        const tables = ['task_assignments', 'projects', 'task_replacements', 'users'];
        
        for (const table of tables) {
            try {
                const [rows] = await connection.query(`DESCRIBE ${table}`);
                console.log(`\n--- ${table} ---`);
                rows.forEach(row => console.log(`${row.Field} (${row.Type})`));
            } catch (e) {
                console.log(`\n--- ${table} DOES NOT EXIST or Error: ${e.message} ---`);
            }
        }
    } catch (error) {
        console.error('Connection Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkSchema();
