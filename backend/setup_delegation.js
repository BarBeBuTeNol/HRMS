
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hrms_db',
    port: process.env.DB_PORT || 3306
};

async function setupDelegation() {
    let connection;
    try {
        console.log('Connecting to database...');
        try {
            connection = await mysql.createConnection(dbConfig);
        } catch (err) {
             // Fallback for empty password or other common local defaults if .env fails
             console.log("Connect failed, trying default root/empty...");
             connection = await mysql.createConnection({
                 host: 'localhost',
                 user: 'root',
                 password: '',
                 database: 'hrms_db'
             });
        }
        
        console.log('Creating work_delegations table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS work_delegations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                requester_id INT NOT NULL,
                delegate_id INT NOT NULL,
                start_date DATE,
                end_date DATE,
                details TEXT,
                status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending',
                chro_acknowledged BOOLEAN DEFAULT 0,
                chro_read BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Inserting mock data for delegations...');
        // Insert a mock delegation request (assuming user IDs 1 and 2 exist, if not we try generally low numbers)
        // We will check for existing users first to be safe
        const [users] = await connection.query("SELECT id FROM users LIMIT 2");
        if (users.length >= 2) {
             const requester = users[0].id;
             const delegate = users[1].id;
             
             await connection.query(`
                INSERT INTO work_delegations (requester_id, delegate_id, start_date, end_date, details, status)
                VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'ขอฝากงานดูแลโปรเจกต์ A ระหว่างที่ลาพักร้อน', 'Accepted')
             `, [requester, delegate]);
             console.log('Inserted mock delegation request.');
        } else {
            console.log("Not enough users to insert mock delegation.");
        }
        
        console.log('Checking chro_read column in leave_requests...');
         /* Add chro_read column to leave_requests if not exists */
        try {
             await connection.query("ALTER TABLE leave_requests ADD COLUMN chro_read BOOLEAN DEFAULT 0");
             console.log("Added chro_read column to leave_requests");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                 console.log("chro_read column already exists in leave_requests");
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

setupDelegation();
