import pool from "./config/db";

async function testConnection() {
  console.log("Testing DB Connection...");
  try {
    const [rows] = await pool.query("SELECT 1 as val");
    console.log("✅ Connection Successful! Result:", rows);
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection Failed:", error);
    process.exit(1);
  }
}

testConnection();
