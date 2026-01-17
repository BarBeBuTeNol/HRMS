import express from 'express';
import HeadDashboardController from '../controllers/HeadDashboardController';
import TeamPerformanceController from '../controllers/TeamPerformanceController';

const router = express.Router();

// GET /api/head/dashboard-stats/:userId
router.get('/dashboard-stats/:userId', HeadDashboardController.getDashboardStats);

// GET /api/head/employees/:userId
router.get('/employees/:userId', HeadDashboardController.getEmployees);

// GET /api/head/delegation-data/:userId
router.get('/delegation-data/:userId', HeadDashboardController.getDelegationData);

// POST /api/head/delegate-work
router.post('/delegate-work', HeadDashboardController.processDelegation);

// GET /api/head/projects
router.get('/projects', HeadDashboardController.getProjects);

// GET /api/head/department-tasks/:headId
router.get('/department-tasks/:headId', HeadDashboardController.getDepartmentTasks);

// POST /api/head/tasks/create
router.post('/tasks/create', HeadDashboardController.createTask);

// GET /api/head/replacement-requests/:headId
router.get('/replacement-requests/:headId', HeadDashboardController.getReplacementRequests);

// PUT /api/head/replacement-requests/:requestId
router.put('/replacement-requests/:requestId', HeadDashboardController.processReplacementRequest);

// Team Performance Routes
// GET /api/head/team-performance-overview/:headId
router.get('/team-performance-overview/:headId', TeamPerformanceController.getOverview);

// GET /api/head/team-performance-members/:headId
router.get('/team-performance-members/:headId', TeamPerformanceController.getMembersPerformance);

export default router;
