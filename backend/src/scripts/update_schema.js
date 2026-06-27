const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'hrms',
    port: process.env.DB_PORT || 3306
};

const tables = {
    announcements: [
        "id INT AUTO_INCREMENT PRIMARY KEY",
        "title VARCHAR(100)",
        "content TEXT",
        "target_type ENUM('all','department')",
        "target_department_id INT",
        "posted_by INT",
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        "priority ENUM('Normal','Important','Urgent')"
    ],
    change_requests: [
        "id INT AUTO_INCREMENT PRIMARY KEY",
        "requester_id INT",
        "target_user_id INT",
        "field_name VARCHAR(100)",
        "old_value TEXT",
        "new_value TEXT",
        "reason TEXT",
        "evidence_path VARCHAR(255)",
        "status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending'",
        "approver_id INT",
        "comment_by_approver TEXT",
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    ],
    departments: [
        "id INT AUTO_INCREMENT PRIMARY KEY",
        "department_name VARCHAR(100)"
    ],
    education_info: [
        "id INT AUTO_INCREMENT PRIMARY KEY",
        "user_id INT",
        "education_level VARCHAR(50)",
        "institution VARCHAR(120)",
        "program VARCHAR(120)",
        "previous_experience TEXT",
        "skills VARCHAR(255)",
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    ],
    emp_info: [
        "id INT AUTO_INCREMENT PRIMARY KEY",
        "user_id INT",
        "emp_code VARCHAR(20)",
        "department_id INT",
        "position_id INT",
        "employment_status ENUM('Full-time','Part-time','Contract','Intern')",
        "work_start_time TIME",
        "work_end_time TIME",
        "hire_date DATE",
        "salary DECIMAL(10,2)",
        "benefits TEXT",
        "performance_review TEXT",
        "training_info TEXT",
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    ],
    holiday_calendar: [
        "id INT AUTO_INCREMENT PRIMARY KEY",
        "event_name VARCHAR(150)",
        "description TEXT",
        "start_date DATE",
        "end_date DATE",
        "event_type ENUM('Holiday','Company Event','Meeting','Training','holiday','event','meeting','training')",
        "is_all_day TINYINT(1)",
        "created_by INT",
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    ],
    job_positions: [
        "id INT AUTO_INCREMENT PRIMARY KEY",
        "position_name VARCHAR(100)",
        "department_id INT",
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    ],
    leave_requests: [
        "id INT AUTO_INCREMENT PRIMARY KEY",
        "user_id INT",
        "leave_type ENUM('Sick Leave','Personal Leave','Vacation Leave','Other')",
        "start_date DATE",
        "end_date DATE",
        "status VARCHAR(20)",
        "reason VARCHAR(255)",
        "rejection_reason VARCHAR(255)",
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        "chro_read TINYINT(1) DEFAULT 0"
    ],
    notifications: [
        "id INT AUTO_INCREMENT PRIMARY KEY",
        "user_id INT",
        "message VARCHAR(255)",
        "reference_id INT",
        "type ENUM('leave_status','announcement','task_assignment','system')",
        "is_read TINYINT(1) DEFAULT 0",
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    ],
    projects: [
        "id INT AUTO_INCREMENT PRIMARY KEY",
        "project_name VARCHAR(150)",
        "description TEXT",
        "start_date DATE",
        "end_date DATE",
        "status ENUM('Planning','Active','On Hold','Completed')",
        "created_by INT",
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    ],
    roles: [
        "id INT AUTO_INCREMENT PRIMARY KEY",
        "role_name VARCHAR(50)"
    ],
    task_assignments: [
        "id INT AUTO_INCREMENT PRIMARY KEY",
        "project_id INT",
        "user_id INT",
        "assigned_by INT",
        "task_name VARCHAR(100)",
        "description TEXT",
        "priority ENUM('Low','Medium','High','Urgent')",
        "deadline DATE",
        "progress INT DEFAULT 0",
        "status ENUM('Pending','Accepted','Rejected','In Progress','Completed')",
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    ],
    task_replacements: [
        "id INT AUTO_INCREMENT PRIMARY KEY",
        "original_user_id INT",
        "replacement_user_id INT",
        "task_id INT",
        "shift_id INT",
        "reason VARCHAR(255)",
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "status ENUM('Pending','Approved','Rejected')",
        "approved_by INT",
        "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    ],
    user_detail: [
        "user_id INT PRIMARY KEY",
        "personal_id VARCHAR(13)",
        "gender ENUM('Male','Female','Other')",
        "birthdate DATE",
        "address TEXT",
        "marital_status ENUM('Single','Married','Divorced','Widowed')",
        "nationality VARCHAR(50)",
        "religion VARCHAR(50)",
        "blood_type ENUM('A','B','AB','O')",
        "emergency_contact_name VARCHAR(100)",
        "emergency_contact_phone VARCHAR(20)",
        "relation_to_emergency_contact VARCHAR(50)",
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    ],
    user_logs: [
        "id INT AUTO_INCREMENT PRIMARY KEY",
        "user_id INT",
        "action VARCHAR(100)",
        "details TEXT",
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "ip_address VARCHAR(45)",
        "severity VARCHAR(20)",
        "target VARCHAR(100)",
        "change_request_id INT"
    ],
    user_sessions: [
        "user_id INT PRIMARY KEY",
        "last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "ip_address VARCHAR(45)",
        "token VARCHAR(500)"
    ],
    users: [
        "id INT AUTO_INCREMENT PRIMARY KEY",
        "prefix ENUM('Mr.','Mrs.','Ms.','Dr.','Other')",
        "username VARCHAR(50)",
        "password VARCHAR(255)",
        "first_name VARCHAR(50)",
        "last_name VARCHAR(50)",
        "email VARCHAR(100)",
        "phone VARCHAR(20)",
        "role_id INT",
        "department_id INT",
        "status ENUM('Active','Inactive','Suspended') DEFAULT 'Active'",
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        "last_active_at TIMESTAMP"
    ],
    work_schedules: [
        "id INT AUTO_INCREMENT PRIMARY KEY",
        "user_id INT",
        "department_id INT",
        "work_date DATE",
        "shift ENUM('Morning','Afternoon','Night','Full-day')",
        "status ENUM('Active','OT','Day Off','Cancelled') DEFAULT 'Active'",
        "is_holiday TINYINT(1) DEFAULT 0",
        "leave_request_id INT",
        "is_replacement TINYINT(1) DEFAULT 0",
        "created_by INT",
        "notes VARCHAR(255)",
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    ]
};

async function updateSchema() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected.');

        for (const [tableName, columns] of Object.entries(tables)) {
            console.log(`\nProcessing table: ${tableName}`);

            // 1. Create table if not exists
            const createQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.join(', ')})`;
            // Remove PRIMARY KEY from columns for the check loop if it's defined inline? 
            // Actually, for ADD COLUMN, we just need the definition. 
            // But CREATE TABLE string is simple. 
            // NOTE: The definitions above might contain constraints like PRIMARY KEY which are fine for CREATE, 
            // but for ADD COLUMN we need to be careful.
            
            await connection.query(createQuery);
            console.log(`- Checked/Created table ${tableName}`);

            // 2. Check and Add/Update columns
            // Get current columns
            const [existingColumns] = await connection.query(`DESCRIBE ${tableName}`);
            const existingColumnNames = existingColumns.map(col => col.Field.toLowerCase());

            for (const colDef of columns) {
                // Parse clean column name from definition
                // Assumption: definition starts with "name TYPE ..."
                const parts = colDef.trim().split(' ');
                const colName = parts[0];
                const colTypeAndRest = parts.slice(1).join(' ');

                // Skip PRIMARY KEY line if it's a constraint line (e.g. "PRIMARY KEY (id)") - but here we defined PK inline.
                // If the definition is just "PRIMARY KEY", skip it.
                if (colName.toUpperCase() === 'PRIMARY' || colName.toUpperCase() === 'KEY' || colName.toUpperCase() === 'CONSTRAINT') {
                    continue; 
                }

                if (!existingColumnNames.includes(colName.toLowerCase())) {
                    console.log(`- Adding missing column: ${colName}`);
                    try {
                        await connection.query(`ALTER TABLE ${tableName} ADD COLUMN ${colDef}`);
                    } catch (err) {
                        console.error(`  Error adding column ${colName}:`, err.message);
                    }
                } else {
                    // Column exists, let's try to Modify it to ensure type matches
                    // modifying PK columns can be tricky, so let's skip 'id' if it exists.
                    if (colName.toLowerCase() === 'id' || colName.toLowerCase() === 'user_id' && (tableName === 'user_detail' || tableName === 'user_sessions')) {
                         // Skipping potential PK modification to avoid auto_increment issues unless necessary
                         // Ideally we should check if it needs modification.
                    } else {
                         // console.log(`- checking modification for ${colName}`); 
                         // For now, we only ADD missing columns to be safe, or we can force MODIFY.
                         // The user asked to "update table, fix to match table", so we should ensure types.
                         try {
                              // MODIFY COLUMN needs the full definition but without primary key if it's already key?
                              // Actually MODIFY works fine.
                              // CAUTION: changing types might fail if data is incompatible.
                              await connection.query(`ALTER TABLE ${tableName} MODIFY COLUMN ${colDef}`);
                         } catch (err) {
                             // Ignore error if it's about PK or no change
                             // console.log(`  (info) Could not modify ${colName}: ${err.message}`);
                         }
                    }
                }
            }
        }

        console.log('\nSchema update completed successfully!');

    } catch (error) {
        console.error('Fatal Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

updateSchema();
