import { Request, Response } from 'express';
import HeadDashboardRepository from '../repository/HeadDashboardRepository';
import TaskReplacementRepository from '../repository/TaskReplacementRepository';

class HeadDashboardController {
    async getDashboardStats(req: Request, res: Response) {
        try {
            const { userId } = req.params; // Head's ID
            if (!userId) {
                return res.status(400).json({ message: "User ID is required" });
            }

            // 1. Get Department Stats & ID
            const deptStats = await HeadDashboardRepository.getDepartmentStats(userId);
            if (!deptStats || !deptStats.departmentId) {
                return res.status(404).json({ message: "Department not found for this user" });
            }

            const deptId = deptStats.departmentId;

            // 2. Parallel Fetch for other sections
            const [todayStatus, actionItems, leaveAnalytics] = await Promise.all([
                HeadDashboardRepository.getTodayStatus(deptId),
                HeadDashboardRepository.getActionItems(deptId),
                HeadDashboardRepository.getLeaveAnalytics(deptId)
            ]);

            res.json({
                overview: deptStats,
                attendance: todayStatus,
                actions: actionItems,
                analytics: leaveAnalytics
            });

        } catch (error: any) {
            console.error("Error fetching head dashboard stats:", error);
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    }

    async getEmployees(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const { search, position } = req.query;

            // 1. Get Department ID
            const deptStats = await HeadDashboardRepository.getDepartmentStats(userId);
            if (!deptStats || !deptStats.departmentId) {
                return res.status(404).json({ message: "Department not found for this user" });
            }

            const deptId = deptStats.departmentId;

            // 2. Get Employees
            const employees = await HeadDashboardRepository.getDepartmentEmployees(
                deptId, 
                search as string, 
                position as string
            );

            res.json(employees);

        } catch (error: any) {
            console.error("Error fetching department employees:", error);
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    }

    async getDelegationData(req: Request, res: Response) {
        try {
            const { userId } = req.params;

            // 1. Get Dept ID
            const deptStats = await HeadDashboardRepository.getDepartmentStats(userId);
            if (!deptStats || !deptStats.departmentId) return res.status(404).json({ message: "Department not found" });

            const deptId = deptStats.departmentId;

            // 2. Fetch Work and Employees
            const [workItems, employees] = await Promise.all([
                HeadDashboardRepository.getDepartmentWork(deptId),
                HeadDashboardRepository.getDepartmentEmployees(deptId)
            ]);

            res.json({ workItems, employees });
        } catch (error: any) {
            console.error("Error fetching delegation data:", error);
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    }

    async processDelegation(req: Request, res: Response) {
        try {
            const { task_id, shift_id, original_user_id, replacement_user_id, reason, priority } = req.body;

            const result = await TaskReplacementRepository.createAssignment({
                task_id,
                shift_id,
                original_user_id,
                replacement_user_id,
                reason,
                priority
            });

            res.status(200).json({ message: "Delegation successful", result });
        } catch (error: any) {
             console.error("Error processing delegation:", error);
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    }

    // --- New Methods for Task Assignment Page ---

    async getProjects(req: Request, res: Response) {
        try {
            const projects = await HeadDashboardRepository.getAllProjects();
            res.json(projects);
        } catch (error: any) {
            console.error("Error fetching projects:", error);
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    }

    async getDepartmentTasks(req: Request, res: Response) {
        try {
            const { headId } = req.params;
            const { search, status, priority } = req.query;

            // 1. Get Dept ID
            const deptStats = await HeadDashboardRepository.getDepartmentStats(headId);
            if (!deptStats || !deptStats.departmentId) return res.status(404).json({ message: "Department not found" });
            const deptId = deptStats.departmentId;

            // 2. Fetch Tasks
            const tasks = await HeadDashboardRepository.getDepartmentTasks(deptId, {
                search: search as string,
                status: status as string,
                priority: priority as string
            });

            res.json(tasks);
        } catch (error: any) {
            console.error("Error fetching department tasks:", error);
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    }

    async createTask(req: Request, res: Response) {
        try {
            const { project_id, assigned_to_user_id, task_name, description, priority, deadline, assigned_by_head_id } = req.body;

            // Optional: Verify assigned_to_user_id belongs to head's department
            
            const result = await HeadDashboardRepository.createTask({
                project_id,
                assigned_to_user_id,
                task_name,
                description,
                priority,
                deadline,
                assigned_by_head_id
            });

            res.status(201).json({ success: true, taskId: result.insertId });
        } catch (error: any) {
            console.error("Error creating task:", error);
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    }

    async getReplacementRequests(req: Request, res: Response) {
        try {
            const { headId } = req.params;

            // 1. Get Dept ID
            const deptStats = await HeadDashboardRepository.getDepartmentStats(headId);
            if (!deptStats || !deptStats.departmentId) return res.status(404).json({ message: "Department not found" });
            const deptId = deptStats.departmentId;

            const requests = await HeadDashboardRepository.getReplacementRequests(deptId);
            res.json(requests);
        } catch (error: any) {
            console.error("Error fetching replacement requests:", error);
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    }

    async processReplacementRequest(req: Request, res: Response) {
        try {
            const { requestId } = req.params;
            const { status, remarks } = req.body; // status: 'Approved' | 'Rejected'

            if (!['Approved', 'Rejected'].includes(status)) {
                return res.status(400).json({ message: "Invalid status" });
            }

            const result = await HeadDashboardRepository.updateReplacementRequestStatus(requestId, status, remarks);
            res.json({ success: true, message: `Request ${status}` });
        } catch (error: any) {
            console.error("Error processing replacement request:", error);
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    }
}

export default new HeadDashboardController();
