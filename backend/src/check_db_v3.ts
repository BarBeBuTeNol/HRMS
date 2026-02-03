import pool from './config/db';
import fs from 'fs';

async function checkData() {
  const log: string[] = [];
  try {
    log.push('--- Checking Delegation Data Availability ---');

    // 1. Find all Heads
    const [heads]: any = await pool.query(
      `SELECT id, first_name, last_name, department_id, email FROM users WHERE role_id = (SELECT id FROM roles WHERE role_name = 'Head')`
    );
    
    if (heads.length === 0) {
        log.push("No users with 'Head' role found!");
    }

    for (const head of heads) {
      log.push(`\nChecking for Head: ${head.first_name} ${head.last_name} (ID: ${head.id}, Dept: ${head.department_id})`);
      
      if (!head.department_id) {
        log.push('  -> No Department ID assigned!');
        continue;
      }

      // 2. Count Employees in Dept
      const [employees]: any = await pool.query(
        `SELECT id, first_name, last_name FROM users WHERE department_id = ? AND id != ?`,
        [head.department_id, head.id]
      );
      log.push(`  -> Employees in Department: ${employees.length}`);
      employees.forEach((emp: any) => {
         log.push(`     - ${emp.first_name} ${emp.last_name} (ID: ${emp.id})`);
      });

      // 3. Count Shifts
      const [shifts]: any = await pool.query(
        `SELECT ws.id, ws.work_date, ws.shift, u.first_name 
         FROM work_schedules ws 
         JOIN users u ON ws.user_id = u.id 
         WHERE u.department_id = ? AND ws.work_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)`,
        [head.department_id]
      );
      log.push(`  -> Shifts (last 3 months): ${shifts.length}`);
      shifts.forEach((s: any) => {
          log.push(`     - [${s.work_date}] ${s.shift} (${s.first_name})`);
      });

      // 4. Count Tasks
      const [tasks]: any = await pool.query(
        `SELECT ta.id, ta.task_name, ta.deadline, u.first_name 
         FROM task_assignments ta 
         JOIN users u ON ta.user_id = u.id 
         WHERE u.department_id = ?`,
        [head.department_id]
      );
      log.push(`  -> Tasks: ${tasks.length}`);
      tasks.forEach((t: any) => {
          log.push(`     - [${t.deadline}] ${t.task_name} (${t.first_name})`);
      });
    }

    fs.writeFileSync('db_results.txt', log.join('\n'));
    console.log("Results written to db_results.txt");
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();
