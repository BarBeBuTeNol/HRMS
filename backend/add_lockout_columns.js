const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env") });

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS || undefined,
    database: process.env.DB_NAME,
  });

  try {
    console.log("Checking if failed_login_attempts column exists...");
    const [columns] = await pool.query("SHOW COLUMNS FROM users LIKE 'failed_login_attempts'");
    
    if (columns.length === 0) {
      console.log("Adding failed_login_attempts and locked_until columns to users table...");
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN failed_login_attempts INT DEFAULT 0,
        ADD COLUMN locked_until DATETIME DEFAULT NULL
      `);
      console.log("Columns added successfully.");
    } else {
      console.log("Columns already exist.");
    }
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    pool.end();
  }
}

run();
