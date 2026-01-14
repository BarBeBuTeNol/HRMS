
import pool from './backend/src/config/db';

async function checkSchema() {
  try {
    const [rows] = await pool.query('DESCRIBE user_logs');
    console.log('Schema for user_logs:', rows);
    process.exit(0);
  } catch (err) {
    console.error('Error describing table:', err);
    process.exit(1);
  }
}

checkSchema();
