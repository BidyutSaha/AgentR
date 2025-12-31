import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
    handleGetCandidatePaperByIdOnly,
    handleUpdateCandidatePaperByIdOnly,
    handleDeleteCandidatePaperByIdOnly
} from '../controllers/candidatePaper.controller';
import { updateCandidatePaperSchema } from '../services/candidatePaper/candidatePaper.schema';

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

/**
 * @route   PATCH /v1/papers/:paperId
 * @desc    Update a candidate paper by ID (without needing project ID)
 * @access  Protected
 */
router.patch(
    '/:paperId',
    authenticate,
    validate(updateCandidatePaperSchema),
    handleUpdateCandidatePaperByIdOnly
);

/**
 * @route   DELETE /v1/papers/:paperId
 * @desc    Delete a candidate paper by ID (without needing project ID)
 * @access  Protected
 */
router.delete(
    '/:paperId',
    authenticate,
    handleDeleteCandidatePaperByIdOnly
);

export default router;
