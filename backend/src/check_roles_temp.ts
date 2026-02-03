import pool from "./config/db";

async function checkRoles() {
  try {
    console.log("Fetching Roles...");
    const [roles] = await pool.query("SELECT * FROM roles");
    console.log("Roles List:", roles);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    process.exit();
  }
}

checkRoles();
