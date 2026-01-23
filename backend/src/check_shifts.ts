import pool from "./config/db";

async function checkShifts() {
  console.log("Checking valid shift values...");
  try {
    const [rows] = await pool.query(
      "SELECT DISTINCT shift FROM work_schedules",
    );
    console.log("Existing SHIFT values:", rows);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fetching shifts:", error);
    process.exit(1);
  }
}

checkShifts();
