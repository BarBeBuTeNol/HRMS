import pool from "./config/db";

async function checkLeaveTypes() {
  try {
    const [rows] = await pool.query("SELECT * FROM leave_types");
    console.log("Leave Types Data:", rows);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    process.exit();
  }
}

checkLeaveTypes();
