import pool from "../config/db";

async function test() {
  try {
    const [rows] = await pool.query("SELECT id, username FROM users");
    console.log("✅ DB Connected! Users:", rows);
  } catch (err) {
    console.error("❌ DB Error:", err);
  }
}

test();
