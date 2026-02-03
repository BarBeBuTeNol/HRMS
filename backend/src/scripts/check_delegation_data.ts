import pool from '../config/db';

async function checkData() {
  try {
    console.log('--- Checking Delegation Data Availability ---');

    // 1. Find all Heads
    const [heads]: any = await pool.query(
      `SELECT id, first_name, last_name, department_id FROM users WHERE role_id = (SELECT id FROM roles WHERE role_name = 'Head')`
    );
    console.log(`Found ${heads.length} Head(s):`);
    
    for (const head of heads) {
      console.log(`\nChecking for Head: ${head.first_name} ${head.last_name} (ID: ${head.id}, Dept: ${head.department_id})`);
      
      if (!head.department_id) {
        console.log('  -> No Department ID assigned!');
        continue;
      }

      // 2. Count Employees in Dept
      const [employees]: any = await pool.query(
        `SELECT count(*) as count FROM users WHERE department_id = ? AND id != ?`,
        [head.department_id, head.id]
      );
      console.log(`  -> Employees in Department: ${employees[0].count}`);

      // 3. Count Shifts in Dept (Last 3 months)
      const [shifts]: any = await pool.query(
        `SELECT count(*) as count FROM work_schedules ws 
         JOIN users u ON ws.user_id = u.id 
         WHERE u.department_id = ? AND ws.work_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)`,
        [head.department_id]
      );
      console.log(`  -> Shifts in last 3 months: ${shifts[0].count}`);

      // 4. Count Active Tasks
      const [tasks]: any = await pool.query(
        `SELECT count(*) as count FROM task_assignments ta 
         JOIN users u ON ta.user_id = u.id 
         WHERE u.department_id = ?`,
        [head.department_id]
      );
      console.log(`  -> Total Tasks: ${tasks[0].count}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();
