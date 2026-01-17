
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hrms_db', // Adjust if needed
};

async function test() {
    try {
        const conn = await mysql.createConnection(dbConfig);
        console.log("Connected!");

        const [usersCols] = await conn.query("DESCRIBE users");
        console.log("USERS:", usersCols.map(c => c.Field).join(', '));

        const [empCols] = await conn.query("DESCRIBE emp_info");
        console.log("EMP_INFO:", empCols.map(c => c.Field).join(', '));

        const [jobCols] = await conn.query("DESCRIBE job_positions");
        console.log("JOB_POSITIONS:", jobCols.map(c => c.Field).join(', '));
        
        const [udCols] = await conn.query("DESCRIBE user_detail");
        console.log("USER_DETAIL:", udCols.map(c => c.Field).join(', '));

        await conn.end();
    } catch(e) {
        console.error("ERROR:", e);
    }
}

test();
