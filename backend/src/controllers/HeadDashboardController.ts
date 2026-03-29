import { Request, Response } from "express";
import HeadDashboardRepository from "../repository/HeadDashboardRepository";
import TaskReplacementRepository from "../repository/TaskReplacementRepository";
import NotificationRepository from "../repository/notificationRepository";
import ActivityLogRepository from "../repository/ActivityLogRepository";

class HeadDashboardController {
  async getDashboardStats(req: Request, res: Response) {
    try {
      const { userId } = req.params; // Head's ID
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // 1. Get Department Stats & ID
      const deptStats =
        await HeadDashboardRepository.getDepartmentStats(userId);
      if (!deptStats || !deptStats.departmentId) {
        return res
          .status(404)
          .json({ message: "Department not found for this user" });
      }

      const deptId = deptStats.departmentId;

      // 2. Parallel Fetch for other sections
      const [todayStatus, actionItems, leaveAnalytics] = await Promise.all([
        HeadDashboardRepository.getTodayStatus(deptId),
        HeadDashboardRepository.getActionItems(deptId),
        HeadDashboardRepository.getLeaveAnalytics(deptId),
      ]);

      res.json({
        overview: deptStats,
        attendance: todayStatus,
        actions: actionItems,
        analytics: leaveAnalytics,
      });
    } catch (error: any) {
      console.error("Error fetching head dashboard stats:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async getEmployees(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { search, position } = req.query;


      // 1. Get Department ID
      console.log(`[getEmployees] Fetching department for Head ID: ${userId}`);
      const deptStats =
        await HeadDashboardRepository.getDepartmentStats(userId);
      console.log(`[getEmployees] Dept Stats:`, deptStats);

      if (!deptStats || !deptStats.departmentId) {
        console.warn(`[getEmployees] Department not found for Head ID: ${userId}`);
        return res
          .status(404)
          .json({ message: "Department not found for this user" });
      }

      const deptId = deptStats.departmentId;

      // 2. Get Employees
      const employees = await HeadDashboardRepository.getDepartmentEmployees(
        deptId,
        search as string,
        position as string,
      );

      res.json(employees);
    } catch (error: any) {
      console.error("Error fetching department employees:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async getDelegationData(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // 1. Get Dept ID
      const deptStats =
        await HeadDashboardRepository.getDepartmentStats(userId);
      if (!deptStats || !deptStats.departmentId)
        return res.status(404).json({ message: "Department not found" });

      const deptId = deptStats.departmentId;

      // 2. Fetch Work and Employees
      const [workItems, employees] = await Promise.all([
        HeadDashboardRepository.getDepartmentWork(deptId),
        HeadDashboardRepository.getDepartmentEmployees(deptId),
      ]);

      res.json({ workItems, employees });
    } catch (error: any) {
      console.error("Error fetching delegation data:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async processDelegation(req: Request, res: Response) {
    try {
      const {
        task_id,
        shift_id,
        original_user_id,
        replacement_user_id,
        reason,
        priority,
      } = req.body;

      const result = await TaskReplacementRepository.createAssignment({
        task_id,
        shift_id,
        original_user_id,
        replacement_user_id,
        reason,
        priority,
      });

      res.status(200).json({ message: "Delegation successful", result });
    } catch (error: any) {
      console.error("Error processing delegation:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  // --- New Methods for Task Assignment Page ---

  async getProjects(req: Request, res: Response) {
    try {
      console.log("[getProjects] Fetching all projects...");
      const projects = await HeadDashboardRepository.getAllProjects();
      console.log(`[getProjects] Found ${projects.length} projects.`);
      res.json(projects);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async getDepartmentTasks(req: Request, res: Response) {
    try {
      const { headId } = req.params;
      const { search, status, priority } = req.query;

      // 1. Get Dept ID
      const deptStats =
        await HeadDashboardRepository.getDepartmentStats(headId);
      if (!deptStats || !deptStats.departmentId)
        return res.status(404).json({ message: "Department not found" });
      const deptId = deptStats.departmentId;

      // 2. Fetch Tasks
      const tasks = await HeadDashboardRepository.getDepartmentTasks(deptId, {
        search: search as string,
        status: status as string,
        priority: priority as string,
      });

      res.json(tasks);
    } catch (error: any) {
      console.error("Error fetching department tasks:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async createTask(req: Request, res: Response) {
    try {
      const {
        project_id,
        assigned_to_user_id,
        task_name,
        description,
        priority,
        deadline,
        assigned_by_head_id,
      } = req.body;

      // Optional: Verify assigned_to_user_id belongs to head's department

      const result = await HeadDashboardRepository.createTask({
        project_id,
        assigned_to_user_id,
        task_name,
        description,
        priority,
        deadline,
        assigned_by_head_id,
      });

      

      // 3. Notify the user
      await NotificationRepository.createBulkNotifications([
        [
            assigned_to_user_id, 
            `You have been assigned to new task: ${task_name}`, 
            0, 
            new Date(), 
            result.insertId, // reference_id (Task ID)
            'task_assignment'
        ]
      ]);

      // 4. Log Activity
      await ActivityLogRepository.logActivity({
        user_id: assigned_by_head_id, // The head who assigned
        action: "Assign Task",
        details: `Assigned task '${task_name}' (Project ID: ${project_id}) to User ID: ${assigned_to_user_id}`,
        ip_address: req.ip
      });

      res.status(201).json({ success: true, taskId: result.insertId });
    } catch (error: any) {
      console.error("Error creating task:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async getReplacementRequests(req: Request, res: Response) {
    try {
      const { headId } = req.params;

      // 1. Get Dept ID
      const deptStats =
        await HeadDashboardRepository.getDepartmentStats(headId);
      if (!deptStats || !deptStats.departmentId)
        return res.status(404).json({ message: "Department not found" });
      const deptId = deptStats.departmentId;

      const requests =
        await HeadDashboardRepository.getReplacementRequests(deptId);
      res.json(requests);
    } catch (error: any) {
      console.error("Error fetching replacement requests:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async processReplacementRequest(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      const { status, remarks } = req.body; // status: 'Approved' | 'Rejected'

      if (!["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const result =
        await HeadDashboardRepository.updateReplacementRequestStatus(
          requestId,
          status,
          remarks,
        );
      res.json({ success: true, message: `Request ${status}` });
    } catch (error: any) {
      console.error("Error processing replacement request:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async getEmployeeInsights(req: Request, res: Response) {
    try {
      const { empId } = req.params;
      const insights = await HeadDashboardRepository.getEmployeeInsights(empId);

      if (!insights) {
        return res
          .status(404)
          .json({ message: "Employee not found or no data" });
      }

      res.json(insights);
    } catch (error: any) {
      console.error("Error fetching employee insights:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
  async createProject(req: Request, res: Response) {
    try {
      const {
        project_name,
        description,
        start_date,
        end_date,
        status,
        priority,
        created_by, // headId from frontend
      } = req.body;

      if (!project_name || !start_date || !end_date || !created_by) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const result = await HeadDashboardRepository.createProject({
        project_name,
        description,
        start_date,
        end_date,
        status: status || "Planning",
        priority: priority || "Medium",
        created_by,
      });

      const projectId = result.insertId;

      // Handle Attachment (Mocked File Path for now as Upload Logic is complex)
      if (req.body.attachments) {
         // Assuming attachments is just a filename string from frontend
         await HeadDashboardRepository.addAttachment({
            project_id: projectId,
            file_name: req.body.attachments,
            file_path: "/uploads/" + req.body.attachments, // Mock path
            uploaded_by: created_by
         });
      }

      res.status(201).json({
        success: true,
        message: "Project created successfully",
        projectId: projectId,
      });
    } catch (error: any) {
      console.error("Error creating project:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
}

export default new HeadDashboardController();
