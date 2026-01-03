import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
    handleGetMyUsage,
    handleGetMyUsageCredits,
    handleGetProjectUsage,
    handleGetProjectUsageCredits,
    handleGetAllUsersBilling,
    handleGetAllUsersBillingCredits,
} from '../controllers/llmUsage.controller';

const router = Router();

/**
 * @route   GET /v1/llm-usage/my-usage
 * @desc    Get current user's LLM usage and costs in USD
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
 * @route   GET /v1/llm-usage/my-usage-credits
 * @desc    Get current user's LLM usage and costs in AI CREDITS
 * @access  Protected
 * @query   startDate (optional) - ISO date string
 * @query   endDate (optional) - ISO date string
 */
router.get(
    '/my-usage-credits',
    authenticate,
    handleGetMyUsageCredits
);

/**
 * @route   GET /v1/llm-usage/project/:projectId
 * @desc    Get project's LLM usage and costs in USD
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
 * @route   GET /v1/llm-usage/project-credits/:projectId
 * @desc    Get project's LLM usage and costs in AI CREDITS
 * @access  Protected
 * @query   startDate (optional) - ISO date string
 * @query   endDate (optional) - ISO date string
 */
router.get(
    '/project-credits/:projectId',
    authenticate,
    handleGetProjectUsageCredits
);

/**
 * @route   GET /v1/llm-usage/admin/all-users
 * @desc    Get billing summary for all users in USD (admin only)
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

/**
 * @route   GET /v1/llm-usage/admin/all-users-credits
 * @desc    Get billing summary for all users in AI CREDITS (admin only)
 * @access  Admin
 * @query   startDate (optional) - ISO date string
 * @query   endDate (optional) - ISO date string
 */
router.get(
    '/admin/all-users-credits',
    authenticate,
    // TODO: Add admin middleware here
    handleGetAllUsersBillingCredits
);

export default router;
