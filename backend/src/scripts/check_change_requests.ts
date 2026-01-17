import pool from '../config/db';

async function checkChangeRequests() {
    try {
        const [rows] = await pool.query('SELECT * FROM change_requests');
        console.log('Change Requests count:', (rows as any).length);
        console.log('Rows:', JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error querying DB:', error);
    } finally {
        process.exit();
    }
}

checkChangeRequests();
