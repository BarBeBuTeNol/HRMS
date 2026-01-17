import { Router } from 'express';
import multer from 'multer';
import { createChangeRequest, getPendingRequests, getRequestHistory, approveChangeRequest, rejectChangeRequest } from '../controllers/changeRequestController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

// Multer config for evidence files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/evidence/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/', requireAuth, upload.single('evidence'), createChangeRequest);
router.get('/pending', requireAuth, getPendingRequests);
router.get('/history', requireAuth, getRequestHistory);
router.put('/:id/approve', requireAuth, approveChangeRequest);
router.put('/:id/reject', requireAuth, rejectChangeRequest);

export default router;
