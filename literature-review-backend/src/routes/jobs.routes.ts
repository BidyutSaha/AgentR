import { Router } from 'express';
import { resumeJob } from '../controllers/jobs.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Resume a job
router.post('/:jobId/resume', authenticate, resumeJob);

export default router;
