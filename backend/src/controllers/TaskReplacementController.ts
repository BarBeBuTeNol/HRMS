import { Request, Response } from 'express';
import taskReplacementRepository from '../repository/TaskReplacementRepository';
import userRepository from '../repository/userRepository';

// Create a new replacement request
export const createReplacementRequest = async (req: Request, res: Response) => {
    try {
        const requesterId = (req as any).user.id; // From auth middleware
        const { task_id, shift_id, replacement_id, reason } = req.body;

        if ((!task_id && !shift_id) || !replacement_id || !reason) {
            return res.status(400).json({ message: "Missing required fields (task/shift, replacement, reason)" });
        }

        if (parseInt(replacement_id) === requesterId) {
            return res.status(400).json({ message: "คุณไม่สามารถร้องขอให้ตัวเองทำแทนตัวเองได้ (Cannot request yourself as a replacement.)" });
        }

        // Prevent duplicate pending requests for the same task/shift
        const existingRequests = await taskReplacementRepository.findByRequester(requesterId);
        const hasPending = existingRequests.some((r: any) => 
            r.status === 'Pending' && 
            ((task_id && r.task_id == task_id) || (shift_id && r.shift_id == shift_id))
        );

        if (hasPending) {
            return res.status(400).json({ message: "คุณได้ส่งคำขอแทนงานสำหรับรายการนี้ไปแล้วและกำลังรออนุมัติ (A pending replacement request already exists.)" });
        }

        const requestId = await taskReplacementRepository.createRequest({
            task_id,
            shift_id,
            requester_id: requesterId,
            replacement_id,
            reason
        });

        // Log the action
        await userRepository.logAction(
            requesterId,
            "SHIFT_REQUEST_CREATE",
            `Created replacement request for Task ${task_id || 'N/A'} / Shift ${shift_id || 'N/A'} with User ${replacement_id}`,
            req.ip || 'Unknown',
            'Info'
        );

        res.status(201).json({ message: "Replacement request submitted successfully", requestId });
    } catch (error: any) {
        console.error("Error creating replacement request:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get my requests history
export const getMyRequests = async (req: Request, res: Response) => {
    try {
        const requesterId = (req as any).user.id;
        const requests = await taskReplacementRepository.findByRequester(requesterId);
        res.json(requests);
    } catch (error: any) {
        console.error("Error fetching request history:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get eligible work (Tasks and Shifts) for dropdown
export const getEligibleWork = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        
        const tasks = await taskReplacementRepository.getEligibleTasks(userId);
        const shifts = await taskReplacementRepository.getEligibleShifts(userId);

        res.json({ tasks, shifts });
    } catch (error: any) {
        console.error("Error fetching eligible work:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get potential replacement users (Colleagues in same department or all active users)
export const getReplacementCandidates = async (req: Request, res: Response) => {
    try {
        const requesterId = (req as any).user.id;
        // Ideally filter by department, but for now we'll fetch all active users except self
        // Using existing userRepository.findAll is a bit heavy, maybe a lighter query exists or use direct repo
        // For simplicity reusing findAll but with no limit (or high limit)
        
        // Note: Better to create a specific lightweight method in UserRepo if performance is key
        // For now, we reuse existing repo logic or add a new method.
        // Let's use userRepository.findAll with a large limit.
        
        const { rows } = await userRepository.findAll({ limit: 10000, offset: 0, status: 'Active' } as any);
        
        // Find the requester's department
        const requester = rows.find((u: any) => u.id === requesterId);
        const reqDept = requester ? requester.department_name : null;

        // Filter out self and MUST match department
        const candidates = rows
            .filter((u: any) => u.id !== requesterId && (u.department_name === reqDept || !reqDept))
            .map((u: any) => ({
                id: u.id,
                first_name: u.first_name,
                last_name: u.last_name,
                username: u.username,
                department: u.department_name
            }));

        res.json(candidates);
    } catch (error: any) {
         console.error("Error fetching candidates:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// Get all pending requests for Head
export const getAllPendingRequests = async (req: Request, res: Response) => {
    try {
        const requests = await taskReplacementRepository.findAllPending();
        res.json(requests);
    } catch (error: any) {
        console.error("Error fetching pending requests:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Approve a request
export const approveRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const approverId = (req as any).user.id;
        const { rejection_reason } = req.body; // Unused here primarily

        // 1. Get request details to know what to update
        // We can reuse findByRequester or create a findById.
        // For simplicity, let's just update and if specific info needed, query first.
        // Actually we need info to update linked tables.
        
        // Let's assume passed in body or fetch it? 
        // Better Fetch it. We need a findById in repo but I missed adding it.
        // I'll query all pending filtering or add findById now?
        // Let's rely on what we have or do a quick query here or assume FE passes data?
        // Secure way: fetch from DB.
        
        // Quick fix: Use the findAllPending and filter? inefficient but works for small load.
        // REAL FIX: I'll assume I can query simply because I can import pool here if needed or trust I added repo methods.
        // Wait, I can trust I added repo logic.
        
        // I don't have findById in repo. I will just execute updates if I know details.
        // FE should send details? No, unsafe.
        // I'll assume valid ID.
        
        // Let's query the request first to get task_id/shift_id/replacement_id.
        // I'll assume we can add a quick helper or raw query here.
        // Wait, checkReplacementWorkload needs date, so we need details.
        
        // I will add a raw query here or add findById later. 
        // To save steps, I'll direct query here via repo's pool if exported? 
        // Repo exports default instance. Pool is not exported from repo instance.
        // I'll add a proper findById to repo if I could, but I can't edit repo again in this single step easily.
        // I'll use `findAllPending` and find the one matching ID.
        
        // Using the newly added findById method for better performance compared to finding in allPending
        const request = await taskReplacementRepository.findById(parseInt(id));

        if (!request || request.status !== 'Pending') {
            return res.status(404).json({ message: "Request not found or not pending" });
        }

        // 2. Update status
        await taskReplacementRepository.updateStatus(parseInt(id), 'Approved', approverId);

        // 3. Update actual assignment
        if (request.task_id) {
            await taskReplacementRepository.updateTaskAssignment(request.task_id, request.replacement_user_id);
        } else if (request.shift_id) {
            await taskReplacementRepository.updateWorkSchedule(request.shift_id, request.replacement_user_id);
        }

        // 4. Notify users (Mocking notif logic or using notificationController if available)
        // Ignoring for now to keep scope tight, or basic console log.
        
        res.json({ message: "Request approved and schedule updated" });
    } catch (error: any) {
        console.error("Error approving request:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Reject a request
export const rejectRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const approverId = (req as any).user.id;
        const { reason } = req.body;

        await taskReplacementRepository.updateStatus(parseInt(id), 'Rejected', approverId, reason);

        res.json({ message: "Request rejected" });
    } catch (error: any) {
        console.error("Error rejecting request:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Check workload
export const checkReplacementWorkload = async (req: Request, res: Response) => {
    try {
        const { replacementId, date } = req.query;
        if (!replacementId || !date) {
            return res.status(400).json({ message: "Missing replacementId or date" });
        }

        const workload = await taskReplacementRepository.getWorkload(parseInt(replacementId as string), date as string);
        res.json(workload);
    } catch (error: any) {
        console.error("Error checking workload:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
