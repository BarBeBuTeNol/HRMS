const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTable() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '1234',
    database: process.env.DB_NAME || 'hrms'
  });

  console.log('Connected to DB...');

  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        user_id INT PRIMARY KEY,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table user_sessions created or already exists.');
  } catch (err) {
    console.error('❌ Error creating table:', err);
  } finally {
    await conn.end();
  }
}

createTable();
