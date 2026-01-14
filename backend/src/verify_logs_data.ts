
import pool from './config/db';

async function checkLogs() {
    try {
        const [rows]: any = await pool.query("SELECT COUNT(*) as count FROM user_logs");
        console.log("Total logs in DB:", rows[0].count);

        const [recent]: any = await pool.query("SELECT id, created_at, action FROM user_logs ORDER BY created_at DESC LIMIT 5");
        console.log("Most recent 5 logs:");
        console.table(recent);

        process.exit(0);
    } catch (error) {
        console.error("Error checking logs:", error);
        process.exit(1);
    }
}

checkLogs();
