
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function check() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASS || undefined,
      database: process.env.DB_NAME,
    });
    const [rows] = await pool.query("SHOW TABLES");
    console.log("Tables:", JSON.stringify(rows.map(r => Object.values(r)[0])));
    process.exit(0);
  } catch(e) { console.error(e); process.exit(1); }
}
check();
