
import pool from '../config/db';

async function checkData() {
    try {
        console.log("Checking user_sessions...");
        const [sessions] = await pool.query("SHOW TABLES LIKE 'user_sessions'");
        if ((sessions as any).length > 0) {
            const [count] = await pool.query("SELECT COUNT(*) as c FROM user_sessions");
            console.log("user_sessions count:", (count as any)[0].c);
            const [rows] = await pool.query("SELECT * FROM user_sessions LIMIT 1");
            console.log("user_sessions sample:", rows);
        } else {
            console.log("user_sessions table DOES NOT EXIST");
        }

        console.log("\nChecking emp_info salary...");
        const [salaryData] = await pool.query("SELECT salary FROM emp_info LIMIT 5");
        console.log("emp_info salary sample:", salaryData);
        
        console.log("\nChecking departments...");
        const [depts] = await pool.query("SELECT * FROM departments LIMIT 5");
        console.log("departments sample:", depts);

        console.log("\nChecking joins for Budget Overview...");
        const [joinTest] = await pool.query(`
            SELECT d.department_name as name, ei.salary
            FROM emp_info ei
            JOIN users u ON ei.user_id = u.id
            JOIN departments d ON u.department_id = d.id
            LIMIT 5
        `);
        console.log("Join test result:", joinTest);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit();
    }
}

checkData();
