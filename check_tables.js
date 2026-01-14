
import db from './backend/src/config/db.js';
const pool = db.default || db;

async function checkTables() {
  try {
    const [rows] = await pool.query("SHOW TABLES");
    console.log("Tables:", rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkTables();
