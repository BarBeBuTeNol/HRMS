import pool from "../config/db";
import { RowDataPacket } from "mysql2";

class HeadDashboardRepository {
  // 1. Get Department Stats
  async getDepartmentStats(headId: string) {
    // Get Head's Department
    const [head] = await pool.query<RowDataPacket[]>(
      "SELECT department_id FROM users WHERE id = ?",
      [headId],
    );
    const deptId = head[0]?.department_id;

    if (!deptId) return null;

    // Total Employees in Department
    const [totalEmp] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM users WHERE department_id = ? AND role_id != 1",
      [deptId],
    );

    // Pending Leave Requests in Department
    const [pendingLeaves] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM leave_requests lr 
             JOIN users u ON lr.user_id = u.id 
             WHERE u.department_id = ? AND lr.status = 'Pending'`,
      [deptId],
    );

    // Active Tasks in Department
    const [activeTasks] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM task_assignments ta
             JOIN users u ON ta.user_id = u.id
             WHERE u.department_id = ? AND ta.status = 'In Progress'`,
      [deptId],
    );

    return {
      totalEmployees: totalEmp[0].count,
      pendingLeaves: pendingLeaves[0].count,
      activeTasks: activeTasks[0].count,
      departmentId: deptId,
    };
  }

  // 2. Attendance & Schedule (Today)
  async getTodayStatus(deptId: number) {
    // Who is working today (Shift)
    const [working] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.first_name, u.last_name, ws.shift
             FROM work_schedules ws 
             JOIN users u ON ws.user_id = u.id 
             WHERE u.department_id = ? AND ws.work_date = CURDATE()`,
      [deptId],
    );

    // Who is on leave today
    const [onLeave] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.first_name, u.last_name, lr.leave_type 
             FROM leave_requests lr 
             JOIN users u ON lr.user_id = u.id 
             WHERE u.department_id = ? 
             AND lr.status = 'Approved' 
             AND CURDATE() BETWEEN lr.start_date AND lr.end_date`,
      [deptId],
    );

    return {
      working,
      onLeave,
    };
  }

  // 3. Action Items (To-Do)
  async getActionItems(deptId: number) {
    // Recent Pending Leaves
    const [pendingLeaves] = await pool.query<RowDataPacket[]>(
      `SELECT lr.id, u.first_name, u.last_name, lr.leave_type, lr.start_date, lr.end_date, lr.reason 
             FROM leave_requests lr 
             JOIN users u ON lr.user_id = u.id 
             WHERE u.department_id = ? AND lr.status = 'Pending' 
             ORDER BY lr.created_at ASC LIMIT 5`,
      [deptId],
    );

    // Task Progress (Employees with lowest progress on Active tasks)
    const [taskProgress] = await pool.query<RowDataPacket[]>(
      `SELECT ta.id, ta.task_name, u.first_name, u.last_name, ta.progress, ta.deadline 
             FROM task_assignments ta 
             JOIN users u ON ta.user_id = u.id 
             WHERE u.department_id = ? AND ta.status = 'In Progress' 
             ORDER BY ta.progress ASC LIMIT 5`,
      [deptId],
    );

    return {
      pendingLeaves,
      taskProgress,
    };
  }

  // 4. Analytics (Simple)
  async getLeaveAnalytics(deptId: number) {
    // Most common leave types this month
    const [leaveTypes] = await pool.query<RowDataPacket[]>(
      `SELECT leave_type, COUNT(*) as count 
             FROM leave_requests lr 
             JOIN users u ON lr.user_id = u.id 
             WHERE u.department_id = ? 
             AND MONTH(lr.start_date) = MONTH(CURDATE()) 
             AND YEAR(lr.start_date) = YEAR(CURDATE())
             AND lr.status = 'Approved'
             GROUP BY leave_type`,
      [deptId],
    );

    return leaveTypes;
  }

  // 5. Employee List for Department
  async getDepartmentEmployees(
    deptId: number,
    search: string = "",
    position: string = "",
  ) {
    const filters: string[] = ["u.department_id = ?"];
    const queryParams: any[] = [deptId];

    if (search) {
      const like = `%${search}%`;
      filters.push(
        `(u.first_name LIKE ? OR u.last_name LIKE ? OR ei.emp_code LIKE ?)`,
      );
      queryParams.push(like, like, like);
    }

    if (position) {
      filters.push(`jp.position_name = ?`);
      queryParams.push(position);
    }

    const where = `WHERE ${filters.join(" AND ")}`;

    const [employees] = await pool.query<RowDataPacket[]>(
      `SELECT 
                u.id, u.first_name, u.last_name, u.email, u.phone, u.status AS account_status,
                ei.emp_code, ei.employment_status, 
                jp.position_name,
                d.department_name
             FROM users u
             LEFT JOIN emp_info ei ON u.id = ei.user_id AND ei.id = (SELECT MAX(id) FROM emp_info WHERE user_id = u.id)
             LEFT JOIN job_positions jp ON ei.position_id = jp.id
             LEFT JOIN departments d ON u.department_id = d.id
             ${where}
             ORDER BY u.first_name ASC`,
      queryParams,
    );

    return employees;
  }
  // 6. Get Department Work (Shifts & Tasks) for Delegation
  async getDepartmentWork(deptId: number) {
    // Fetch Shifts (Relaxed date filter: Last 3 months + Future)
    const [shifts] = await pool.query<RowDataPacket[]>(
      `SELECT ws.id, u.id as user_id, u.first_name, u.last_name, ws.work_date, ws.shift AS title, 'Shift' as type
             FROM work_schedules ws
             JOIN users u ON ws.user_id = u.id
             WHERE u.department_id = ? AND ws.work_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
             ORDER BY ws.work_date DESC`,
      [deptId],
    );

    // Fetch Active Tasks (Relaxed status filter or keep as is)
    const [tasks] = await pool.query<RowDataPacket[]>(
      `SELECT ta.id, u.first_name, u.last_name, ta.deadline AS work_date, ta.task_name AS title, 'Task' as type
             FROM task_assignments ta
             JOIN users u ON ta.user_id = u.id
             WHERE u.department_id = ?
             ORDER BY ta.deadline ASC`,
      [deptId],
    );

    return [...shifts, ...tasks];
  }

  // --- New Methods for Task Assignment Page ---

  async getAllProjects() {
    const [projects] = await pool.query<RowDataPacket[]>(
      "SELECT id, project_name, start_date, end_date, status FROM projects ORDER BY start_date DESC",
    );
    return projects;
  }

  async getDepartmentTasks(
    deptId: number,
    filters: { search?: string; status?: string; priority?: string },
  ) {
    let query = `
            SELECT ta.id, ta.task_name, ta.description, ta.priority, ta.deadline, ta.status, ta.progress,
                   u.first_name, u.last_name, p.project_name
            FROM task_assignments ta
            JOIN users u ON ta.user_id = u.id
            LEFT JOIN projects p ON ta.project_id = p.id
            WHERE u.department_id = ?
        `;
    const params: any[] = [deptId];

    if (filters.search) {
      query += ` AND (ta.task_name LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)`;
      params.push(
        `%${filters.search}%`,
        `%${filters.search}%`,
        `%${filters.search}%`,
      );
    }
    if (filters.status) {
      query += ` AND ta.status = ?`;
      params.push(filters.status);
    }
    if (filters.priority) {
      query += ` AND ta.priority = ?`;
      params.push(filters.priority);
    }

    query += ` ORDER BY ta.deadline ASC`;

    const [tasks] = await pool.query<RowDataPacket[]>(query, params);
    return tasks;
  }

  async createTask(data: any) {
    const {
      project_id,
      assigned_to_user_id,
      task_name,
      description,
      priority,
      deadline,
      assigned_by_head_id,
    } = data;
    const [result] = await pool.query<any>(
      `INSERT INTO task_assignments 
             (project_id, user_id, task_name, description, priority, deadline, assigned_by, status, progress, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', 0, NOW(), NOW())`,
      [
        project_id,
        assigned_to_user_id,
        task_name,
        description,
        priority,
        deadline,
        assigned_by_head_id,
      ],
    );
    return result;
  }

  async getReplacementRequests(deptId: number) {
    const [requests] = await pool.query<RowDataPacket[]>(
      `SELECT tr.id, tr.reason, tr.created_at, tr.status,
                    t.task_name, t.deadline,
                    u_req.first_name AS requester_name, u_req.last_name AS requester_lastname
             FROM task_replacements tr
             JOIN task_assignments t ON tr.task_id = t.id
             JOIN users u_req ON tr.original_user_id = u_req.id
             WHERE u_req.department_id = ? AND tr.status = 'Pending'
             ORDER BY tr.created_at DESC`,
      [deptId],
    );
    return requests;
  }

  async updateReplacementRequestStatus(
    requestId: string,
    status: string,
    remarks?: string,
  ) {
    const connection = await pool.getConnection(); // Use transaction for safety
    try {
      await connection.beginTransaction();

      // 1. Update Replacement Request Status
      await connection.query(
        `UPDATE task_replacements SET status = ?, admin_remarks = ?, updated_at = NOW() WHERE id = ?`,
        [status, remarks || null, requestId],
      );

      // 2. If Approved, Logic to Find Replacement could be complex.
      // For now, if just 'Approved', we might not swap user_id yet UNLESS replacement_user_id is set.
      // But the request form might not have replacement_user_id if it's open.
      // Assuming for now it just marks request as approved.
      // The USER REQUEST says "Request List: Items that employees asked to move or find replacement".

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getEmployeeInsights(empId: string) {
    const query = `
            SELECT 
                u.id, u.first_name, u.last_name, u.email, u.phone, ud.profile_image_url,
                ud.address, ud.birthdate, ud.emergency_contact_name, ud.emergency_contact_phone,
                jp.position_name,
                ei.employment_status, ei.performance_review, ei.training_info, ei.hire_date,
                edu.education_level, edu.institution, edu.skills, edu.previous_experience
            FROM users u
            LEFT JOIN user_detail ud ON u.id = ud.user_id
            LEFT JOIN emp_info ei ON u.id = ei.user_id AND ei.id = (SELECT MAX(id) FROM emp_info WHERE user_id = u.id)
            LEFT JOIN job_positions jp ON ei.position_id = jp.id
            LEFT JOIN education_info edu ON u.id = edu.user_id
            WHERE u.id = ?
        `;
    const [rows] = await pool.query<RowDataPacket[]>(query, [empId]);
    return rows[0] || null;
  }
  async createProject(data: {
    project_name: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    priority: string;
    created_by: number; // Head ID
  }) {
    const {
      project_name,
      description,
      start_date,
      end_date,
      status,
      priority,
      created_by,
    } = data;
    const [result] = await pool.query<any>(
      `INSERT INTO projects 
             (project_name, description, start_date, end_date, status, priority, created_by, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [project_name, description, start_date, end_date, status, priority, created_by],
    );
    return result;
  }

  async addAttachment(data: {
    project_id: number;
    file_name: string;
    file_path: string;
    uploaded_by: number;
  }) {
    const { project_id, file_name, file_path, uploaded_by } = data;
    const [result] = await pool.query<any>(
      `INSERT INTO attachments 
             (project_id, file_name, file_path, uploaded_by, created_at)
             VALUES (?, ?, ?, ?, NOW())`,
      [project_id, file_name, file_path, uploaded_by],
    );
    return result;
  }
}

export default new HeadDashboardRepository();
