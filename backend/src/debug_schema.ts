import pool from "./config/db";

async function run() {
  try {
    const [rows] = await pool.query("DESCRIBE job_positions");
    const fs = require("fs");
    fs.writeFileSync("schema_output.json", JSON.stringify(rows, null, 2));
    console.log("Schema written to schema_output.json");
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}

run();
