import pool from "./config/db";

async function checkSchema() {
  try {
    console.log("Checking leave_requests columns...");
    const [columns] = await pool.query("SHOW COLUMNS FROM leave_requests");
    console.log("Columns:", columns);

    console.log("\nChecking recent leave requests...");
    const [recent] = await pool.query(
      "SELECT * FROM leave_requests ORDER BY created_at DESC LIMIT 2",
    );
    console.log("Recent Requests:", recent);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    process.exit();
  }
}

checkSchema();
