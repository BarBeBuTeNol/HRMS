import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

class TeamPerformanceRepository {

    // 1. Get Overall Team Progress (For Graph)
    async getTeamOverview(headId: string) {
        // Get Head's Department
        const [head] = await pool.query<RowDataPacket[]>('SELECT department_id FROM users WHERE id = ?', [headId]);
        const deptId = head[0]?.department_id;

        if (!deptId) return null;

        // Task Status Counts
        const [taskStats] = await pool.query<RowDataPacket[]>(
            `SELECT 
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                COUNT(*) as total_tasks
             FROM task_assignments ta
             JOIN users u ON ta.user_id = u.id
             WHERE u.department_id = ?`,
            [deptId]
        );

        return {
            departmentId: deptId,
            stats: taskStats[0]
        };
    }

    // 2. Get Individual Member Metrics
    async getIndividualPerformance(headId: string) {
        // Get Head's Department
        const [head] = await pool.query<RowDataPacket[]>('SELECT department_id FROM users WHERE id = ?', [headId]);
        const deptId = head[0]?.department_id;

        if (!deptId) return [];

        // Fetch data for each member
        // We join users, emp_info, job_positions
        // We correlate with task_assignments and leave_requests via subqueries or separate processing (complex query)
        
        const query = `
            SELECT 
                u.id, u.first_name, u.last_name, u.image,
                jp.position_name,
                ei.performance_review, ei.training_info,
                
                -- Task Metrics
                (SELECT COUNT(*) FROM task_assignments ta WHERE ta.user_id = u.id) as total_assigned,
                (SELECT COUNT(*) FROM task_assignments ta WHERE ta.user_id = u.id AND ta.status = 'Completed') as total_completed,
                (SELECT COUNT(*) FROM task_assignments ta WHERE ta.user_id = u.id AND ta.status = 'In Progress') as total_in_progress,
                (SELECT AVG(progress) FROM task_assignments ta WHERE ta.user_id = u.id AND ta.status != 'Pending') as avg_progress,
                
                -- On-time Delivery (Assuming 'Completed' status and checking if updated_at <= deadline, otherwise just count completed)
                -- Simpler approximation: Count of tasks completed before deadline
                (SELECT COUNT(*) FROM task_assignments ta 
                 WHERE ta.user_id = u.id 
                 AND ta.status = 'Completed' 
                 AND ta.updated_at <= ta.deadline) as on_time_completed,

                 -- Leave Metrics
                 (SELECT COUNT(*) FROM leave_requests lr WHERE lr.user_id = u.id AND lr.status = 'Approved') as approved_leaves,

                 -- Overdue Tasks (Impact metric)
                 (SELECT COUNT(*) FROM task_assignments ta 
                  WHERE ta.user_id = u.id 
                  AND ta.deadline < NOW() 
                  AND (ta.status != 'Completed' OR (ta.status = 'Completed' AND ta.updated_at > ta.deadline))) as total_overdue

            FROM users u
            LEFT JOIN emp_info ei ON u.id = ei.user_id AND ei.id = (SELECT MAX(id) FROM emp_info WHERE user_id = u.id)
            LEFT JOIN job_positions jp ON ei.position_id = jp.id
            WHERE u.department_id = ? AND u.role_id != 1 -- Exclude Admin if any, keep Head? usually exclude self or include? User asked for "subordinates" (luk nong), so usually exclude Head.
            -- Assuming Head role_id is distinct or we filter by id != headId
            AND u.id != ?
            ORDER BY u.first_name ASC
        `;

        const [members] = await pool.query<RowDataPacket[]>(query, [deptId, headId]);

        return members;
    }
}

export default new TeamPerformanceRepository();
