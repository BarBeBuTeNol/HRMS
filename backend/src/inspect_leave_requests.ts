import pool from './config/db';

async function run() {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM leave_requests");
    console.log(JSON.stringify(cols, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
