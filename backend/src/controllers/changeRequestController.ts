import { Request, Response } from 'express';
import changeRequestRepository from '../repository/ChangeRequestRepository';
import userRepository from '../repository/userRepository';
import pool from '../config/db';

// CREATE Request
export const createChangeRequest = async (req: Request, res: Response) => {
    try {
        const { targetUserId, changes, reason } = req.body;
        const requesterId = (req as any).user.id;
        const file = req.file; // From multer

        if (!changes || !reason) {
            return res.status(400).json({ message: "Missing changes or reason" });
        }
        if (!file) {
            return res.status(400).json({ message: "Evidence file is required" });
        }

        const parsedChanges = JSON.parse(changes); // Expecting JSON string of array
        const evidencePath = file.path; // Or filename depending on storage config

        for (const change of parsedChanges) {
            await changeRequestRepository.create({
                requester_id: requesterId,
                target_user_id: targetUserId,
                field_name: change.field,
                old_value: change.oldValue,
                new_value: change.newValue,
                reason: reason,
                evidence_path: evidencePath
            });
        }

        // TODO: Notification to all CHROs (Implementation pending notification utils)
        // For now logging it
        // Log the action to user_logs
        const ip = req.ip || req.socket.remoteAddress || 'Unknown';
        await userRepository.logAction(
            requesterId, 
            "CHANGE_REQUEST_SUBMIT", 
            `Submitted change request for User ID: ${targetUserId}. Field: ${parsedChanges.map((c:any) => c.field).join(', ')}. Reason: ${reason}`,
            ip as string,
            'Warning',
            `User ID: ${targetUserId}`,
            undefined // We don't have the specific ID unless we track each one, but batch logic makes this tricky. Omitting for now or could log last one.
        );
        
        console.log(`[Notification] New Change Request by User ${requesterId} for User ${targetUserId}`);

        res.status(201).json({ message: "Change request submitted successfully" });
    } catch (err: any) {
        console.error("Create Change Request Error:", err);
        res.status(500).json({ message: err.message });
    }
};

// GET Pending Requests
export const getPendingRequests = async (req: Request, res: Response) => {
    try {
        const requests = await changeRequestRepository.findPending();
        res.json(requests);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// APPROVE Request
export const approveChangeRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const approverId = (req as any).user.id;
        const { comment } = req.body;

        const request = await changeRequestRepository.findById(Number(id));
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        // 1. Self-Approval Block
        if (request.requester_id === approverId) {
            return res.status(403).json({ message: "You cannot approve your own request." });
        }

        if (request.status !== 'Pending') {
            return res.status(400).json({ message: "Request is not pending" });
        }

        // 2. Apply Change to Real Table
        const targetId = request.target_user_id;
        const fieldName = request.field_name;
        const newValue = request.new_value;

        // Determine which table to update based on field name
        // Mapping Logic:
        // Users: firstName, lastName, email
        // UserDetail: personalId, gender, birthDate, address, nationality, religion, etc.
        // EmpInfo: departmentId, jobPosition, salary, etc.
        // EducationInfo: educationLevel, institution, etc.

        // Simple mapping for demonstration - this needs to be robust
        if (['firstName', 'lastName', 'email'].includes(fieldName)) {
            // Update users table
             await userRepository.update(targetId.toString(), { [fieldName]: newValue });
        } else if (['personalId', 'gender', 'birthDate', 'address', 'nationality', 'religion', 'maritalStatus'].includes(fieldName)) {
            // Map camelCase to snake_case for DB
            const dbFieldMap: any = {
                personalId: 'personal_id',
                birthDate: 'birthdate',
                maritalStatus: 'marital_status'
            };
            const dbField = dbFieldMap[fieldName] || fieldName;
            
            await pool.query(`UPDATE user_detail SET ${dbField} = ? WHERE user_id = ?`, [newValue, targetId]);
        } else if (['salary', 'jobPosition', 'employmentStatus', 'departmentId'].includes(fieldName)) {
             const dbFieldMap: any = {
                jobPosition: 'job_position_id',
                employmentStatus: 'employment_status',
                departmentId: 'department_id' // Note: this is in users or emp_info? Usually emp_info for history, users for current. Assuming emp_info here based on previous code.
            };
            const dbField = dbFieldMap[fieldName] || fieldName;
             await pool.query(`UPDATE emp_info SET ${dbField} = ? WHERE user_id = ? AND id = (SELECT MAX(id) FROM emp_info WHERE user_id = ?)`, [newValue, targetId, targetId]);
        }
        // Add other cases as needed...

        // 3. Update Request Status
        await changeRequestRepository.updateStatus(Number(id), 'Approved', approverId, comment || "Approved");

        res.json({ message: "Request approved and changes applied." });

    } catch (err: any) {
        console.error("Approve Request Error:", err);
        res.status(500).json({ message: err.message });
    }
};

// REJECT Request
export const rejectChangeRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const approverId = (req as any).user.id;
        const { comment } = req.body;

        const request = await changeRequestRepository.findById(Number(id));
        if (!request) return res.status(404).json({ message: "Request not found" });

         if (request.status !== 'Pending') {
            return res.status(400).json({ message: "Request is not pending" });
        }

        // Self-rejection is allowed? Usually yes, you can cancel your own. 
        // But for strict auditing, maybe another person should reject. 
        // For now, allowing rejection by anyone authorized.

        await changeRequestRepository.updateStatus(Number(id), 'Rejected', approverId, comment || "Rejected");

        res.json({ message: "Request rejected." });
    } catch (err: any) {
         res.status(500).json({ message: err.message });
    }
};
