
import { Request, Response } from 'express';
import userRepository from '../repository/userRepository';

export const getLogs = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string || '';
        const action = req.query.action as string || 'all';
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        const offset = (page - 1) * limit;

        const { rows, total } = await userRepository.findAllLogs({
            search,
            action,
            startDate,
            endDate,
            limit,
            offset
        });

        res.json({
            logs: rows,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err: any) {
        console.error("Get Logs Error:", err);
        res.status(500).json({ message: err.message });
    }
};

export const createLog = async (req: Request, res: Response) => {
    try {
        const { userId, action, details, ip_address, severity, target, change_request_id } = req.body;
        
        // Basic validation
        if (!userId || !action || !details) {
             return res.status(400).json({ message: "Missing required fields: userId, action, details" });
        }

        await userRepository.logAction(userId, action, details, ip_address, severity, target, change_request_id);
        
        res.status(201).json({ success: true, message: "Log created successfully" });
    } catch (err: any) {
        console.error("Create Log Error:", err);
        res.status(500).json({ message: err.message });
    }
};
