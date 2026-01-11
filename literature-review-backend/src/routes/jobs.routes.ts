import { Router } from 'express';
import { resumeJob, resumeAllFailedJobs, getJobs } from '../controllers/jobs.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Get jobs (My Jobs)
router.get('/', authenticate, getJobs);

// Resume all failed jobs (Batch)
router.post('/resume-all', authenticate, resumeAllFailedJobs);

// Resume a single job
router.post('/:jobId/resume', authenticate, resumeJob);

export default router;
