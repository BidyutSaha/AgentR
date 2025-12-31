import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
    handleCreateCandidatePaper,
    handleGetCandidatePapers,
    handleGetCandidatePaperById,
    handleUpdateCandidatePaper,
    handleDeleteCandidatePaper,
} from '../controllers/candidatePaper.controller';
import {
    createCandidatePaperSchema,
    updateCandidatePaperSchema,
} from '../services/candidatePaper/candidatePaper.schema';

const router = Router();

/**
 * @route   POST /v1/user-projects/:projectId/papers
 * @desc    Create a new candidate paper for a project
 * @access  Protected
 */
router.post(
    '/:projectId/papers',
    authenticate,
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
    authenticate,
    handleGetCandidatePapers
);

/**
 * @route   GET /v1/user-projects/:projectId/papers/:paperId
 * @desc    Get a single candidate paper by ID
 * @access  Protected
 */
router.get(
    '/:projectId/papers/:paperId',
    authenticate,
    handleGetCandidatePaperById
);

/**
 * @route   PATCH /v1/user-projects/:projectId/papers/:paperId
 * @desc    Update a candidate paper
 * @access  Protected
 */
router.patch(
    '/:projectId/papers/:paperId',
    authenticate,
    validate(updateCandidatePaperSchema),
    handleUpdateCandidatePaper
);

/**
 * @route   DELETE /v1/user-projects/:projectId/papers/:paperId
 * @desc    Delete a candidate paper
 * @access  Protected
 */
router.delete(
    '/:projectId/papers/:paperId',
    authenticate,
    handleDeleteCandidatePaper
);

export default router;
