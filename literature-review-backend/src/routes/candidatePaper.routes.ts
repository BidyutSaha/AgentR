import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
    handleCreateCandidatePaper,
    handleGetCandidatePapers,
    handleGetCandidatePaperById,
    handleDeleteCandidatePaper,
} from '../controllers/candidatePaper.controller';
import { createCandidatePaperSchema } from '../services/candidatePaper/candidatePaper.schema';

const router = Router();

/**
 * All routes require authentication
 */
router.use(authenticate);

/**
 * @route   POST /v1/user-projects/:projectId/papers
 * @desc    Create a new candidate paper for a project
 * @access  Protected
 */
router.post(
    '/:projectId/papers',
    validate(createCandidatePaperSchema),
    handleCreateCandidatePaper
);

/**
 * @route   GET /v1/user-projects/:projectId/papers
 * @desc    Get all candidate papers for a project
 * @access  Protected
 */
router.get(
    '/:projectId/papers',
    handleGetCandidatePapers
);

/**
 * @route   GET /v1/user-projects/:projectId/papers/:paperId
 * @desc    Get a single candidate paper by ID
 * @access  Protected
 */
router.get(
    '/:projectId/papers/:paperId',
    handleGetCandidatePaperById
);

/**
 * @route   DELETE /v1/user-projects/:projectId/papers/:paperId
 * @desc    Delete a candidate paper
 * @access  Protected
 */
router.delete(
    '/:projectId/papers/:paperId',
    handleDeleteCandidatePaper
);

export default router;
