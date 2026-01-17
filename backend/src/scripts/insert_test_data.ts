import pool from '../config/db';

async function insertTestData() {
    try {
        // Find a random user to be the requester
        const [users] = await pool.query('SELECT id FROM users LIMIT 1');
        if ((users as any).length === 0) {
            console.log('No users found to create a request for.');
            return;
        }
        const userId = (users as any)[0].id;

        // Insert a dummy change request
        await pool.query(`
            INSERT INTO change_requests 
            (requester_id, target_user_id, field_name, old_value, new_value, reason, status, created_at, updated_at)
            VALUES (?, ?, 'address', '123 Old St', '456 New Ave', 'Moved to new house', 'Pending', NOW(), NOW())
        `, [userId, userId]);

        console.log('Inserted test change request for user', userId);

        // Verify
        const [rows] = await pool.query('SELECT * FROM change_requests');
        console.log('Current Change Requests:', (rows as any).length);

    } catch (error) {
        console.error('Error inserting test data:', error);
    } finally {
        process.exit();
    }
}

insertTestData();
