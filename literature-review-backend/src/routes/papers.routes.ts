import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { handleGetCandidatePaperByIdOnly } from '../controllers/candidatePaper.controller';

const router = Router();

/**
 * @route   GET /v1/papers/:paperId
 * @desc    Get a single candidate paper by ID (without needing project ID)
 * @access  Protected
 */
router.get(
    '/:paperId',
    authenticate,
    handleGetCandidatePaperByIdOnly
);

export default router;
