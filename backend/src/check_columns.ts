import pool from "./config/db";

async function checkColumns() {
  try {
    console.log("Checking leave_requests columns...");
    const [columns] = await pool.query("SHOW COLUMNS FROM leave_requests");
    console.log("Columns:", columns);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    process.exit();
  }
}

checkColumns();
