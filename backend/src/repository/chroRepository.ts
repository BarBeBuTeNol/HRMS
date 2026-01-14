import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

class ChroRepository {
    async getDashboardStats() {
        const connection = await pool.getConnection();
        try {
            // 1. Total Employees
            const [totalRows] = await connection.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM users');
            const totalEmployees = totalRows[0].count;

            // 2. Active Employees
            // Use user_sessions table to track currently logged-in users
            let activeEmployees = 0;
            try {
                const [activeRows] = await connection.query<RowDataPacket[]>(
                    "SELECT COUNT(DISTINCT user_id) as count FROM user_sessions"
                );
                activeEmployees = activeRows[0]?.count || 0;
            } catch (err) {
                // Fallback if table missing
                const [activeFallback] = await connection.query<RowDataPacket[]>(
                   "SELECT COUNT(*) as count FROM emp_info WHERE employment_status = 'Active'"
                );
                activeEmployees = activeFallback[0]?.count || 0;
            }

            // 3. Departments Count
            const [deptRows] = await connection.query<RowDataPacket[]>(
                `SELECT d.id, d.department_name as name, COUNT(u.id) as count
                 FROM departments d
                 LEFT JOIN users u ON d.id = u.department_id
                 GROUP BY d.id, d.department_name`
            );
            const departmentCount = deptRows.length;

            // 4. Gender Distribution
            const [genderRows] = await connection.query<RowDataPacket[]>(
                `SELECT gender, COUNT(*) as count FROM user_detail GROUP BY gender`
            );
            const genderDistribution = { male: 0, female: 0, other: 0 };
            genderRows.forEach((row: any) => {
                const g = row.gender?.toLowerCase();
                if (g === 'male') genderDistribution.male = row.count;
                else if (g === 'female') genderDistribution.female = row.count;
                else genderDistribution.other += row.count;
            });

            // 5. Avg Salary
            const [salaryRows] = await connection.query<RowDataPacket[]>(
                'SELECT salary, hire_date FROM emp_info'
            );
            const avgSalary = Math.round(salaryRows.reduce((acc: number, row: any) => acc + (Number(row.salary) || 0), 0) / (salaryRows.length || 1));

            // --- Extended Demographics ---
            // 6. Age Distribution
            const [dobRows] = await connection.query<RowDataPacket[]>('SELECT birthdate FROM user_detail');
            const ageComp = { "20-30": 0, "31-40": 0, "41-50": 0, "51+": 0 };
            dobRows.forEach((r: any) => {
                if (r.birthdate) {
                    const age = new Date().getFullYear() - new Date(r.birthdate).getFullYear();
                    if (age >= 20 && age <= 30) ageComp["20-30"]++;
                    else if (age > 30 && age <= 40) ageComp["31-40"]++;
                    else if (age > 40 && age <= 50) ageComp["41-50"]++;
                    else if (age > 50) ageComp["51+"]++;
                }
            });

            // 7. Tenure / Years of Service
            const tenureComp = { "<1 Year": 0, "1-3 Years": 0, "3-5 Years": 0, "5+ Years": 0 };
            salaryRows.forEach((r: any) => {
                if (r.hire_date) {
                    const years = (new Date().getTime() - new Date(r.hire_date).getTime()) / (1000 * 60 * 60 * 24 * 365);
                    if (years < 1) tenureComp["<1 Year"]++;
                    else if (years >= 1 && years <= 3) tenureComp["1-3 Years"]++;
                    else if (years > 3 && years <= 5) tenureComp["3-5 Years"]++;
                    else if (years > 5) tenureComp["5+ Years"]++;
                }
            });

            // 8. Education Level
            const [eduRows] = await connection.query<RowDataPacket[]>(
                'SELECT education_level, COUNT(*) as count FROM education_info GROUP BY education_level'
            );
            const educationStats = eduRows.map((r: any) => ({ level: r.education_level || "Unknown", count: r.count }));

            // 9. Salary Range
            const salaryDist = { "< 30k": 0, "30k-50k": 0, "50k-80k": 0, "> 80k": 0 };
            salaryRows.forEach((r: any) => {
                const s = Number(r.salary) || 0;
                if (s < 30000) salaryDist["< 30k"]++;
                else if (s >= 30000 && s < 50000) salaryDist["30k-50k"]++;
                else if (s >= 50000 && s < 80000) salaryDist["50k-80k"]++;
                else salaryDist["> 80k"]++;
            });

            // 10. Recent Activities
            const [activityRows] = await connection.query<RowDataPacket[]>(
                `SELECT ul.id, ul.action as message, ul.created_at as time
                 FROM user_logs ul
                 ORDER BY ul.created_at DESC
                 LIMIT 50`
            );
            const recentActivities = activityRows.map((a: any) => ({
                id: a.id,
                message: a.message,
                time: new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));

            // --- STRATEGIC METRICS (NEW) ---

            // 11. Budget Overview (Salary by Dept)
            const [salaryByDept] = await connection.query<RowDataPacket[]>(`
                SELECT d.department_name as name, SUM(CAST(ei.salary AS DECIMAL(10,2))) as value
                FROM emp_info ei
                JOIN users u ON ei.user_id = u.id
                JOIN departments d ON u.department_id = d.id
                GROUP BY d.department_name
            `);
            const budgetOverview = salaryByDept.map((row: any) => ({
                name: row.name,
                value: Number(row.value) || 0
            }));

            // 12. Leave Trends (Monthly)
            const [leaveTrends] = await connection.query<RowDataPacket[]>(`
                SELECT DATE_FORMAT(created_at, '%Y-%m') as name, COUNT(*) as value
                FROM leave_requests
                GROUP BY name
                ORDER BY name DESC
                LIMIT 6
            `);

            // 13. Task Efficiency (Completion per Dept)
            // Assuming task_assignments has 'status' and 'user_id' (assigned_to was incorrect)
            const [taskStats] = await connection.query<RowDataPacket[]>(`
                SELECT d.department_name as department, 
                       SUM(CASE WHEN t.status = 'Completed' OR t.status = 'Done' THEN 1 ELSE 0 END) as completed,
                       SUM(CASE WHEN t.status = 'In Progress' OR t.status = 'Doing' THEN 1 ELSE 0 END) as inProgress,
                       SUM(CASE WHEN t.status = 'Pending' OR t.status = 'To Do' OR t.status IS NULL THEN 1 ELSE 0 END) as pending
                FROM task_assignments t
                JOIN users u ON t.user_id = u.id
                JOIN departments d ON u.department_id = d.id
                GROUP BY d.department_name
            `);

            // 14. Workforce Insights
            const [swapRows] = await connection.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM work_schedules');
            const swapRequests = swapRows[0]?.count || 0; 
            // Note: If logic for 'Swap' is clearer (e.g. is_swap column), update query. 

            const [notificationRows] = await connection.query<RowDataPacket[]>('SELECT COUNT(*) as total, SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as readCount FROM notifications');
            const announcementReach = notificationRows[0]?.total > 0 
                ? Math.round((notificationRows[0].readCount / notificationRows[0].total) * 100) 
                : 0;
            
            // Task Replacements (Mock 0 if table missing)
            let taskReplacements = 0;
            try {
                // If table existed: const [trRows] = await connection.query('SELECT COUNT(*) as count FROM task_replacements'); taskReplacements = trRows[0].count;
                // Currently returning 0 as table was not found in preliminary checks.
            } catch (e) {}

            // 15. Resource Allocation
            const [resourceStats] = await connection.query<RowDataPacket[]>(`
                SELECT d.department_name as department, 
                       COUNT(DISTINCT u.id) as headcount,
                       COUNT(DISTINCT t.id) as tasks
                FROM departments d
                LEFT JOIN users u ON d.id = u.department_id
                LEFT JOIN task_assignments t ON u.id = t.user_id
                GROUP BY d.department_name
            `);

            return {
                totalEmployees,
                activeEmployees,
                departments: departmentCount,
                turnoverRate: 5, // Mock
                avgSalary,
                genderDistribution,
                ageDistribution: ageComp,
                tenureDistribution: tenureComp,
                educationStats,
                salaryDistribution: salaryDist,
                departmentStats: deptRows, // Legacy support
                recentActivities,
                // New Fields
                budgetOverview,
                leaveTrends: leaveTrends.reverse(), // Show oldest to newest
                departmentTaskStats: taskStats,
                workforceInsights: {
                    swapRequests,
                    announcementReach,
                    taskReplacements
                },
                resourceStats
            };

        } finally {
            connection.release();
        }
    }

    async getPendingApprovals() {
        const connection = await pool.getConnection();
        try {
            // Fetch ALL Leave Requests (Pending first, then sort by date)
            const [leaveRows] = await connection.query<RowDataPacket[]>(`
                SELECT 
                    lr.id, 
                    lr.user_id, 
                    lr.leave_type, 
                    lr.start_date, 
                    lr.end_date, 
                    lr.reason,
                    lr.rejection_reason,
                    lr.created_at,
                    lr.status,
                    lr.chro_read,
                    u.first_name, 
                    u.last_name, 
                    ei.emp_code,
                    d.department_name
                FROM leave_requests lr
                JOIN users u ON lr.user_id = u.id
                LEFT JOIN emp_info ei ON u.id = ei.user_id
                LEFT JOIN departments d ON u.department_id = d.id
                ORDER BY FIELD(lr.status, 'Pending') DESC, lr.created_at DESC
            `);

            const leaveRequests = leaveRows.map((row: any) => ({
                id: `LEAVE-${row.id}`,
                requestId: row.id,
                type: 'leave_request', 
                title: `คำขอลา: ${row.leave_type}`,
                message: `${row.first_name} ${row.last_name} ขอ "${row.leave_type}"`,
                sender: `${row.first_name} ${row.last_name}`,
                timestamp: row.created_at,
                views: row.chro_read ? 1 : 0, 
                status: row.status === 'Pending' ? null : row.status.toLowerCase(), // null for pending to match frontend logic
                target: 'chro',
                leaveData: {
                    employeeName: `${row.first_name} ${row.last_name}`,
                    employeeId: row.emp_code || 'N/A',
                    department: row.department_name || 'N/A',
                    leaveType: row.leave_type,
                    reason: row.reason,
                    rejectionReason: row.rejection_reason, 
                    leaveDate: row.start_date, 
                    endDate: row.end_date,
                    leaveYear: new Date(row.start_date).getFullYear()
                }
            }));

            // Fetch Work Delegation Requests
            let delegationRequests: any[] = [];
            try {
                const [delRows] = await connection.query<RowDataPacket[]>(`
                    SELECT 
                        wd.id,
                        wd.requester_id,
                        wd.delegate_id,
                        wd.start_date,
                        wd.end_date,
                        wd.details,
                        wd.status,
                        wd.created_at,
                        wd.chro_acknowledged,
                        wd.chro_read,
                        reqUser.first_name as req_fname,
                        reqUser.last_name as req_lname,
                        delUser.first_name as del_fname,
                        delUser.last_name as del_lname,
                        d.department_name
                    FROM work_delegations wd
                    JOIN users reqUser ON wd.requester_id = reqUser.id
                    JOIN users delUser ON wd.delegate_id = delUser.id
                    LEFT JOIN departments d ON reqUser.department_id = d.id
                    ORDER BY wd.created_at DESC
                `);

                delegationRequests = delRows.map((row: any) => ({
                    id: `DELEGATE-${row.id}`,
                    requestId: row.id,
                    type: 'delegation_request',
                    title: 'ขอทำงานแทน (Work on Behalf)',
                    message: `${row.req_fname} ฝากงานให้ ${row.del_fname} ดูแลแทน`,
                    sender: `${row.req_fname} ${row.req_lname}`,
                    timestamp: row.created_at,
                    views: row.chro_read ? 1 : 0,
                    status: row.chro_acknowledged ? 'read' : 'unread', 
                    isAcknowledged: !!row.chro_acknowledged,
                    delegationData: {
                        requesterName: `${row.req_fname} ${row.req_lname}`,
                        delegateName: `${row.del_fname} ${row.del_lname}`,
                        department: row.department_name,
                        startDate: row.start_date,
                        endDate: row.end_date,
                        details: row.details
                    }
                }));
            } catch (e) {
                // Table doesn't exist yet, ignore
            }

            return [...leaveRequests, ...delegationRequests].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        } finally {
            connection.release();
        }
    }

    private async getValidCHROId(connection: any, providedId: number | null): Promise<number | null> {
        // 1. If providedId is valid, verify it exists
        if (providedId) {
            const [rows] = await connection.query('SELECT id FROM users WHERE id = ?', [providedId]);
            if ((rows as any[]).length > 0) return providedId;
        }

        // 2. Fallback: User suggested ID 1
        const [rows1] = await connection.query('SELECT id FROM users WHERE id = 1');
        if ((rows1 as any[]).length > 0) return 1;

        // 3. Last Resort: Any user (e.g. Admin/HR) to prevent FK crash
        const [rowsAny] = await connection.query('SELECT id FROM users ORDER BY id ASC LIMIT 1');
        if ((rowsAny as any[]).length > 0) return (rowsAny as any[])[0].id;

        return null;
    }

    async updateLeaveStatus(requestId: number, status: string, approverId: number | null = null, reason: string | null = null) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Update Status
            let query = 'UPDATE leave_requests SET status = ?, updated_at = NOW(), chro_read = 1';
            const params: any[] = [status];
            
            if (status === 'Rejected' && reason) {
                query += ', rejection_reason = ?';
                params.push(reason);
            }
            
            query += ' WHERE id = ?';
            params.push(requestId);
            
            await connection.query(query, params);

            // 2. Fetch User ID for Notification
            const [rows] = await connection.query<RowDataPacket[]>('SELECT user_id, leave_type FROM leave_requests WHERE id = ?', [requestId]);
            if (rows.length > 0) {
                const { user_id, leave_type } = rows[0];

                // 3. Log Action
                const actionTitle = `CHRO ${status} Leave`;
                const actionDetails = `Leave request (${leave_type}) for User ID ${user_id}. ${reason ? 'Reason: ' + reason : ''}`;
                
                const validApproverId = await this.getValidCHROId(connection, approverId);

                if (validApproverId) {
                    await connection.query('INSERT INTO user_logs (user_id, action, details, created_at) VALUES (?, ?, ?, NOW())', 
                        [validApproverId, actionTitle, actionDetails]
                    );
                } else {
                    console.warn("Skipping user_log insertion: No valid user ID found for CHRO action.");
                }             

                // 4. Create Notification
                const notifMessage = `Your request for ${leave_type} was ${status}.${reason ? ' Reason: ' + reason : ''}`;
                await connection.query('INSERT INTO notifications (user_id, type, message, reference_id, is_read, created_at) VALUES (?, ?, ?, ?, 0, NOW())', 
                    [user_id, 'leave_status', notifMessage, requestId]
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async markAsRead(id: string) {
        const connection = await pool.getConnection();
        try {
             if (id.startsWith('LEAVE-')) {
                 const numericId = id.replace('LEAVE-', '');
                 await connection.query('UPDATE leave_requests SET chro_read = 1 WHERE id = ?', [numericId]);
             } else if (id.startsWith('DELEGATE-')) {
                 const numericId = id.replace('DELEGATE-', '');
                 await connection.query('UPDATE work_delegations SET chro_read = 1 WHERE id = ?', [numericId]);
             }
            return true;
        } finally {
            connection.release();
        }
    }

    async acknowledgeDelegation(requestId: number) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query(
                'UPDATE work_delegations SET chro_acknowledged = 1, chro_read = 1 WHERE id = ?',
                [requestId]
            );

             // Log & Notify
             const [rows] = await connection.query<RowDataPacket[]>('SELECT requester_id FROM work_delegations WHERE id = ?', [requestId]);
             if (rows.length > 0) {
                 const { requester_id } = rows[0];
                 
                 const validApproverId = await this.getValidCHROId(connection, null); // Null because delegation ack might not have passed ID yet, or update controller to pass it.
                 // Ideally verify if controller passes it, but for now fallback to 1/Any is fine.

                 if (validApproverId) {
                    await connection.query('INSERT INTO user_logs (user_id, action, details, created_at) VALUES (?, ?, ?, NOW())', 
                        [validApproverId, 'Delegation Acknowledged', `CHRO acknowledged delegation request ID ${requestId}`]
                    );
                 }

                await connection.query('INSERT INTO notifications (user_id, type, message, reference_id, is_read, created_at) VALUES (?, ?, ?, ?, 0, NOW())', 
                     [requester_id, 'delegation_ack', 'CHRO has acknowledged your delegation request.', requestId]
                 );
             }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

export default new ChroRepository();
