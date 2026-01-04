import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
    handleCreateCandidatePaper,
    handleGetCandidatePapers,
    handleGetCandidatePaperById,
    handleBulkUploadCandidatePapers,
    handleGetBulkUploadTemplate,
} from '../controllers/candidatePaper.controller';
import { upload } from '../middlewares/upload.middleware';
import {
    createCandidatePaperSchema,
} from '../services/candidatePaper/candidatePaper.schema';

const router = Router();

/**
 * @route   GET /v1/user-projects/papers/bulk-upload-template
 * @desc    Download CSV template for bulk upload
 * @access  Protected
 */
router.get(
    '/papers/bulk-upload-template',
    authenticate,
    handleGetBulkUploadTemplate
);

/**
 * @route   POST /v1/user-projects/:projectId/papers/bulk-upload
 * @desc    Bulk upload papers via CSV
 * @access  Protected
 */
router.post(
    '/:projectId/papers/bulk-upload',
    authenticate,
    upload.single('file'),
    handleBulkUploadCandidatePapers
);

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

export default router;
