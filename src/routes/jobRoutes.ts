import { Router } from 'express';
import { JobController } from '../controllers/jobController';

const router = Router();

// Route: GET /api/jobs/:jobId
router.get('/:jobId', JobController.getJobStatus);

// Route: GET /api/jobs/:jobId/result
router.get('/:jobId/result', JobController.getJobResult);

export default router;
