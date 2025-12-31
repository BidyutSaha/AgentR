import { Request, Response, NextFunction } from 'express';
import {
    getUserUsage,
    getProjectUsage,
    getAllUsersBillingSummary,
} from '../services/llmUsage/llmUsage.service';
import logger from '../config/logger';

/**
 * Get current user's LLM usage
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
 * Get project's LLM usage
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
 * Get all users' billing summary (admin only)
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
            data: {
                users: summary,
                totalUsers: summary.length,
                grandTotalCostUsd: summary.reduce((sum, u) => sum + u.totalCostUsd, 0),
            },
        });
    } catch (error) {
        logger.error('Error getting all users billing:', error);
        next(error);
    }
}
