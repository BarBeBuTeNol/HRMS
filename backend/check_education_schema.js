
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hrms_db', // Adjust DB name if needed, usually in .env
};

async function checkSchema() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('DESCRIBE education_info');
        console.log(JSON.stringify(rows, null, 2));
        await connection.end();
    } catch (err) {
        console.error(err);
    }
}

checkSchema();
