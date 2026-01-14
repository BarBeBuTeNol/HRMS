import { Request, Response } from 'express';
import chroRepository from '../repository/chroRepository';

class ChroController {
    async getDashboardStats(req: Request, res: Response) {
        try {
            const stats = await chroRepository.getDashboardStats();
            res.json(stats);
        } catch (error) {
            console.error('Error fetching CHRO dashboard stats:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getApprovals(req: Request, res: Response) {
        try {
            const approvals = await chroRepository.getPendingApprovals();
            res.json(approvals);
        } catch (error) {
            console.error('Error fetching CHRO approvals:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async handleLeaveAction(req: Request, res: Response) {
        try {
            const { requestId, status, reason, approverId } = req.body;
            if (!requestId || !status) {
                 res.status(400).json({ message: 'Missing requestId or status' });
                 return;
            }

            // Use provided approverId or default to 999 (System)
            await chroRepository.updateLeaveStatus(requestId, status, approverId || 999, reason);
            res.json({ message: `Leave request ${status} successfully` });
        } catch (error) {
            console.error('Error updating leave status:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async handleDelegationAction(req: Request, res: Response) {
        try {
            const { requestId, action } = req.body;
            if (!requestId || action !== 'acknowledge') {
                 res.status(400).json({ message: 'Invalid request' });
                 return;
            }

            await chroRepository.acknowledgeDelegation(requestId);
            res.json({ message: 'Delegation acknowledged successfully' });
        } catch (error) {
            console.error('Error acknowledging delegation:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async handleMarkAsRead(req: Request, res: Response) {
        try {
            const { requestId } = req.body;
            if (!requestId) {
                 res.status(400).json({ message: 'Missing requestId' });
                 return;
            }

            await chroRepository.markAsRead(requestId);
            res.json({ message: 'Marked as read successfully' });
        } catch (error) {
            console.error('Error marking as read:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default new ChroController();
