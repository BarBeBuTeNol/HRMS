import { Request, Response } from 'express';
import employeeDashboardRepository from '../repository/employeeDashboardRepository';

export const getEmployeeDashboardData = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
             res.status(400).json({ message: 'User ID is required' });
             return;
        }

        const [
            todayShift,
            taskStats,
            calendarData,
            actionableTasks,
            announcements,
            notifications,
            employeeProfile
        ] = await Promise.all([
            employeeDashboardRepository.getTodayShift(userId),
            employeeDashboardRepository.getTaskStats(userId),
            employeeDashboardRepository.getCalendarData(userId),
            employeeDashboardRepository.getActionableTasks(userId),
            employeeDashboardRepository.getAnnouncements(userId),
            employeeDashboardRepository.getNotifications(userId),
            employeeDashboardRepository.getEmployeeProfile(userId)
        ]);

        res.json({
            todayShift,
            taskStats,
            calendarData,
            actionableTasks,
            announcements,
            notifications,
            employeeProfile
        });

    } catch (error) {
        console.error('Error fetching employee dashboard data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
