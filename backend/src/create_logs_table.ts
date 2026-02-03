import pool from "./config/db";

async function createLogsTable() {
  try {
    console.log("Checking/Creating activity_logs table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("activity_logs table checked/created successfully.");
  } catch (error) {
    console.error("Error creating activity_logs table:", error);
  } finally {
    process.exit();
  }
}

createLogsTable();
