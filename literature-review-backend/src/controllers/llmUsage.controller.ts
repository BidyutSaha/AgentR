import { Request, Response, NextFunction } from 'express';
import {
    getUserUsage,
    getUserUsageCredits,
    getProjectUsage,
    getProjectUsageCredits,
    getAllUsersBillingSummary,
    getAllUsersBillingSummaryCredits,
} from '../services/llmUsage/llmUsage.service';
import logger from '../config/logger';

/**
 * Get current user's LLM usage in USD
 * 
 * @route GET /v1/llm-usage/my-usage
 * @access Protected
 */
export async function handleGetMyUsage(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.userId!;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate as string) : undefined;
        const end = endDate ? new Date(endDate as string) : undefined;

        const usage = await getUserUsage(userId, start, end);

        res.status(200).json({
            success: true,
            data: usage,
        });
    } catch (error) {
        logger.error('Error getting user usage:', error);
        next(error);
    }
}

/**
 * Get current user's LLM usage in AI CREDITS
 * 
 * @route GET /v1/llm-usage/my-usage-credits
 * @access Protected
 */
export async function handleGetMyUsageCredits(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.userId!;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate as string) : undefined;
        const end = endDate ? new Date(endDate as string) : undefined;

        const usage = await getUserUsageCredits(userId, start, end);

        res.status(200).json({
            success: true,
            data: usage,
        });
    } catch (error) {
        logger.error('Error getting user usage credits:', error);
        next(error);
    }
}

/**
 * Get project's LLM usage in USD
 * 
 * @route GET /v1/llm-usage/project/:projectId
 * @access Protected
 */
export async function handleGetProjectUsage(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { projectId } = req.params;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate as string) : undefined;
        const end = endDate ? new Date(endDate as string) : undefined;

        const usage = await getProjectUsage(projectId, start, end);

        res.status(200).json({
            success: true,
            data: usage,
        });
    } catch (error) {
        logger.error('Error getting project usage:', error);
        next(error);
    }
}

/**
 * Get project's LLM usage in AI CREDITS
 * 
 * @route GET /v1/llm-usage/project-credits/:projectId
 * @access Protected
 */
export async function handleGetProjectUsageCredits(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { projectId } = req.params;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate as string) : undefined;
        const end = endDate ? new Date(endDate as string) : undefined;

        const usage = await getProjectUsageCredits(projectId, start, end);

        res.status(200).json({
            success: true,
            data: usage,
        });
    } catch (error) {
        logger.error('Error getting project usage credits:', error);
        next(error);
    }
}

/**
 * Get all users' billing summary in USD (admin only)
 * 
 * @route GET /v1/llm-usage/admin/all-users
 * @access Admin
 */
export async function handleGetAllUsersBilling(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate as string) : undefined;
        const end = endDate ? new Date(endDate as string) : undefined;

        const summary = await getAllUsersBillingSummary(start, end);

        res.status(200).json({
            success: true,
            data: summary,
        });
    } catch (error) {
        logger.error('Error getting all users billing:', error);
        next(error);
    }
}

/**
 * Get all users' billing summary in AI CREDITS (admin only)
 * 
 * @route GET /v1/llm-usage/admin/all-users-credits
 * @access Admin
 */
export async function handleGetAllUsersBillingCredits(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate as string) : undefined;
        const end = endDate ? new Date(endDate as string) : undefined;

        const summary = await getAllUsersBillingSummaryCredits(start, end);

        res.status(200).json({
            success: true,
            data: summary,
        });
    } catch (error) {
        logger.error('Error getting all users billing credits:', error);
        next(error);
    }
}


