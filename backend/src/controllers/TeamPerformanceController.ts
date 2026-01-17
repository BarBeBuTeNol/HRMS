import { Request, Response } from 'express';
import TeamPerformanceRepository from '../repository/TeamPerformanceRepository';

class TeamPerformanceController {

    // Get Overall Stats
    async getOverview(req: Request, res: Response) {
        try {
            const headId = req.params.headId; // Or from auth token middleware
            const data = await TeamPerformanceRepository.getTeamOverview(headId);
            
            if (!data) {
                return res.status(404).json({ message: "Department not found for this user" });
            }

            res.json(data);
        } catch (error) {
            console.error("Error fetching team overview:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    // Get Members Performance
    async getMembersPerformance(req: Request, res: Response) {
        try {
            const headId = req.params.headId;
            const data = await TeamPerformanceRepository.getIndividualPerformance(headId);
            res.json(data);
        } catch (error) {
            console.error("Error fetching member performance:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

export default new TeamPerformanceController();
