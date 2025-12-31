import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
    handleGetMyUsage,
    handleGetProjectUsage,
    handleGetAllUsersBilling,
} from '../controllers/llmUsage.controller';

const router = Router();

/**
 * @route   GET /v1/llm-usage/my-usage
 * @desc    Get current user's LLM usage and costs
 * @access  Protected
 * @query   startDate (optional) - ISO date string
 * @query   endDate (optional) - ISO date string
 */
router.get(
    '/my-usage',
    authenticate,
    handleGetMyUsage
);

/**
 * @route   GET /v1/llm-usage/project/:projectId
 * @desc    Get project's LLM usage and costs
 * @access  Protected
 * @query   startDate (optional) - ISO date string
 * @query   endDate (optional) - ISO date string
 */
router.get(
    '/project/:projectId',
    authenticate,
    handleGetProjectUsage
);

/**
 * @route   GET /v1/llm-usage/admin/all-users
 * @desc    Get billing summary for all users (admin only)
 * @access  Admin
 * @query   startDate (optional) - ISO date string
 * @query   endDate (optional) - ISO date string
 */
router.get(
    '/admin/all-users',
    authenticate,
    // TODO: Add admin middleware here
    handleGetAllUsersBilling
);

export default router;
