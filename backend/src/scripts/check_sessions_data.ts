import pool from "../config/db";

async function check() {
  try {
    const [rows]: any = await pool.query("SELECT * FROM user_sessions");
    console.log("Current user_sessions rows in database:");
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error("Error reading sessions:", err);
  } finally {
    await pool.end();
  }
}

check();
