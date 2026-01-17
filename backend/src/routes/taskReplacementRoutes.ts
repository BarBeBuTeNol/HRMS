import express from 'express';
import { 
    createReplacementRequest, 
    getMyRequests, 
    getEligibleWork, 
    getReplacementCandidates,
    getAllPendingRequests,
    approveRequest,
    rejectRequest,
    checkReplacementWorkload
} from '../controllers/TaskReplacementController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Create a new request
router.post('/', createReplacementRequest);

// Get my request history
router.get('/my-history', getMyRequests);

// Get eligible work (tasks/shifts) for dropdown
router.get('/eligible-work', getEligibleWork);

// Get eligible candidates
router.get('/candidates', getReplacementCandidates);

// --- Head Routes ---
router.get('/pending', getAllPendingRequests);
router.post('/:id/approve', approveRequest);
router.post('/:id/reject', rejectRequest);
router.get('/workload', checkReplacementWorkload);

export default router;
