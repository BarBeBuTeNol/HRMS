
import pool from './config/db';

async function checkData() {
    try {
        const [projects] = await pool.query("SELECT * FROM projects");
        console.log("PROJECTS_COUNT:" + (projects as any).length);
        console.log("PROJECTS_DATA:", JSON.stringify(projects, null, 2));
    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit();
    }
}

checkData();
