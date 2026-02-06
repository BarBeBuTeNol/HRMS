import pool from "./config/db";

async function checkTables() {
  try {
    console.log("Checking tables...");
    const [tables] = await pool.query("SHOW TABLES");
    console.log("Tables:", tables);

    // Check if leave_types exists
    const [columns] = await pool.query("SHOW COLUMNS FROM leave_types").catch(() => [[], []]);
    if ((columns as any).length > 0) {
        console.log("leave_types table exists:", columns);
         const [data] = await pool.query("SELECT * FROM leave_types");
         console.log("leave_types data:", data);
    } else {
        console.log("leave_types table DOES NOT exist.");
    }

  } catch (e) {
    console.error("Error:", e);
  } finally {
    process.exit();
  }
}

checkTables();
