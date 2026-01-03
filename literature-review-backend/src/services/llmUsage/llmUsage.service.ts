import prisma from '../../config/database';
import logger from '../../config/logger';
import { calculateCost } from '../modelPricing/modelPricing.service';

/**
 * LLM Usage Tracking Service
 * 
 * Tracks all LLM API calls for billing and analytics purposes.
 * Captures model, tokens, cost, duration, and other metadata.
 */

export interface LogLlmUsageInput {
    userId: string;
    projectId?: string;
    paperId?: string;
    stage: string;
    modelName: string;
    provider?: string;
    inputTokens: number;
    outputTokens: number;
    durationMs?: number;
    requestId?: string;
    status?: 'success' | 'error' | 'timeout';
    errorMessage?: string;
    metadata?: Record<string, any>;
}

/**
 * Log an LLM API call for billing tracking and deduct credits
 */
export async function logLlmUsage(data: LogLlmUsageInput) {
    try {
        const totalTokens = data.inputTokens + data.outputTokens;

        // Use the centralized pricing service to calculate costs (in USD)
        const costs = await calculateCost(
            data.modelName,
            data.inputTokens,
            data.outputTokens,
            data.provider || 'openai'
        );

        const log = await prisma.llmUsageLog.create({
            data: {
                userId: data.userId,
                projectId: data.projectId,
                paperId: data.paperId,
                stage: data.stage,
                modelName: data.modelName,
                provider: data.provider || 'openai',
                inputTokens: data.inputTokens,
                outputTokens: data.outputTokens,
                totalTokens,
                inputCostUsd: costs.inputCostUsd,
                outputCostUsd: costs.outputCostUsd,
                totalCostUsd: costs.totalCostUsd,
                durationMs: data.durationMs,
                requestId: data.requestId,
                status: data.status || 'success',
                errorMessage: data.errorMessage,
                metadata: data.metadata ? JSON.stringify(data.metadata) : null,
            },
        });

        // Deduct AI Credits from user balance
        await deductCreditsFromUser(data.userId, costs.totalCostUsd);

        logger.info(`LLM usage logged: ${log.id} - ${data.stage} - ${totalTokens} tokens - $${costs.totalCostUsd.toFixed(6)}`);

        return log;
    } catch (error) {
        logger.error('Error logging LLM usage:', error);
        // Don't throw - we don't want billing tracking to break the main flow
        return null;
    }
}

/**
 * Deduct AI Credits from user's balance based on USD cost
 */
export async function deductCreditsFromUser(userId: string, costUsd: number) {
    try {
        // Get current USD to Credits multiplier from history table
        const multiplierRecord = await prisma.creditsMultiplierHistory.findFirst({
            where: { isActive: true },
            select: { usdToCreditsMultiplier: true },
            orderBy: { effectiveFrom: 'desc' },
        });
        const multiplier = multiplierRecord?.usdToCreditsMultiplier || 100.0;

        // Calculate credits to deduct
        const creditsToDeduct = costUsd * multiplier;

        logger.info(`🔍 DEBUG DEDUCT: Cost=${costUsd}, Multiplier=${multiplier}, Deduct=${creditsToDeduct}`);

        if (creditsToDeduct <= 0) {
            logger.warn('⚠️ Zero credit deduction calculated. Skipping DB update.');
            return;
        }

        // Deduct from user balance
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                aiCreditsBalance: {
                    decrement: creditsToDeduct,
                },
            },
            select: {
                email: true,
                aiCreditsBalance: true,
            },
        });

        logger.info(`✅ Deducted ${creditsToDeduct.toFixed(4)} credits from ${updatedUser.email}. Old: ${(updatedUser.aiCreditsBalance + creditsToDeduct).toFixed(4)} -> New: ${updatedUser.aiCreditsBalance.toFixed(4)}`);
    } catch (error) {
        console.error('❌ CRITICAL ERROR DEDUCTING CREDITS:', error);
        logger.error('Error deducting credits:', error);
        // Don't throw - we don't want credit deduction to break the main flow
    }
}

/**
 * Get user's LLM usage for a specific time period
 */
/**
 * Get user's LLM usage cost summary in USD (Total, Project-wise, Paper-wise)
 * 
 * Date Filtering Rules:
 * - startDate missing: No lower bound (includes usage from the beginning)
 * - endDate missing: No upper bound (includes usage until now)
 * - Both missing: Returns lifetime total usage
 */
export async function getUserUsage(
    userId: string,
    startDate?: Date,
    endDate?: Date
) {
    // Construct date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;

    const hasDateFilter = Object.keys(dateFilter).length > 0;

    // 1. Total Cost (All usage for this user)
    const totalUsageWhere: any = { userId };
    if (hasDateFilter) {
        totalUsageWhere.createdAt = dateFilter;
    }

    const totalCostAgg = await prisma.llmUsageLog.aggregate({
        where: totalUsageWhere,
        _sum: { totalCostUsd: true },
    });
    const totalCostUsd = totalCostAgg._sum.totalCostUsd || 0;

    // 2. Project Costs (For existing projects)
    const projects = await prisma.userProject.findMany({
        where: { userId },
        select: {
            id: true,
            projectName: true,
            llmUsageLogs: {
                where: hasDateFilter ? { createdAt: dateFilter } : undefined,
                select: { totalCostUsd: true },
            },
        },
    });

    const projectCosts = projects
        .map((p) => {
            const costUsd = p.llmUsageLogs.reduce((sum, log) => sum + (log.totalCostUsd || 0), 0);
            return {
                projectId: p.id,
                projectName: p.projectName,
                totalCostUsd: costUsd,
            };
        })
        .sort((a, b) => b.totalCostUsd - a.totalCostUsd);

    // 3. Paper Costs (For existing papers)
    const papers = await prisma.candidatePaper.findMany({
        where: {
            project: { userId },
        },
        select: {
            id: true,
            paperTitle: true,
            projectId: true,
            llmUsageLogs: {
                where: hasDateFilter ? { createdAt: dateFilter } : undefined,
                select: { totalCostUsd: true },
            },
        },
    });

    const paperCosts = papers
        .map((p) => {
            const costUsd = p.llmUsageLogs.reduce((sum, log) => sum + (log.totalCostUsd || 0), 0);
            return {
                paperId: p.id,
                paperTitle: p.paperTitle,
                projectId: p.projectId,
                totalCostUsd: costUsd,
            };
        })
        .sort((a, b) => b.totalCostUsd - a.totalCostUsd);

    return {
        totalCostUsd,
        projectCosts,
        paperCosts,
    };
}

/**
 * Get user's LLM usage cost summary in AI CREDITS (Total, Project-wise, Paper-wise)
 * Uses the global usdToCreditsMultiplier from SystemConfig table
 * Also returns remaining AI Credits balance
 */
export async function getUserUsageCredits(
    userId: string,
    startDate?: Date,
    endDate?: Date
) {
    // Construct date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;

    const hasDateFilter = Object.keys(dateFilter).length > 0;

    // Get Global USD to Credits Multiplier from history table
    const multiplierRecord = await prisma.creditsMultiplierHistory.findFirst({
        where: { isActive: true },
        select: { usdToCreditsMultiplier: true },
        orderBy: { effectiveFrom: 'desc' },
    });
    const multiplier = multiplierRecord?.usdToCreditsMultiplier || 100.0; // Default: 1 USD = 100 Credits

    // 1. Total Cost (All usage for this user)
    const totalUsageWhere: any = { userId };
    if (hasDateFilter) {
        totalUsageWhere.createdAt = dateFilter;
    }

    const totalCostAgg = await prisma.llmUsageLog.aggregate({
        where: totalUsageWhere,
        _sum: { totalCostUsd: true },
    });
    const totalCostUsd = totalCostAgg._sum.totalCostUsd || 0;
    const totalCostCredits = totalCostUsd * multiplier;

    // 2. Project Costs (For existing projects)
    const projects = await prisma.userProject.findMany({
        where: { userId },
        select: {
            id: true,
            projectName: true,
            llmUsageLogs: {
                where: hasDateFilter ? { createdAt: dateFilter } : undefined,
                select: { totalCostUsd: true },
            },
        },
    });

    const projectCosts = projects
        .map((p) => {
            const costUsd = p.llmUsageLogs.reduce((sum, log) => sum + (log.totalCostUsd || 0), 0);
            return {
                projectId: p.id,
                projectName: p.projectName,
                totalCostCredits: costUsd * multiplier,
            };
        })
        .sort((a, b) => b.totalCostCredits - a.totalCostCredits);

    // 3. Paper Costs (For existing papers)
    const papers = await prisma.candidatePaper.findMany({
        where: {
            project: { userId },
        },
        select: {
            id: true,
            paperTitle: true,
            projectId: true,
            llmUsageLogs: {
                where: hasDateFilter ? { createdAt: dateFilter } : undefined,
                select: { totalCostUsd: true },
            },
        },
    });

    const paperCosts = papers
        .map((p) => {
            const costUsd = p.llmUsageLogs.reduce((sum, log) => sum + (log.totalCostUsd || 0), 0);
            return {
                paperId: p.id,
                paperTitle: p.paperTitle,
                projectId: p.projectId,
                totalCostCredits: costUsd * multiplier,
            };
        })
        .sort((a, b) => b.totalCostCredits - a.totalCostCredits);

    return {
        totalUsedCredits: totalCostCredits,
        projectUsedCredits: projectCosts,
        paperUsedCredits: paperCosts,
    };
}

/**
 * Get project's LLM usage in USD
 */
export async function getProjectUsage(
    projectId: string,
    startDate?: Date,
    endDate?: Date
) {
    const where: any = { projectId };

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
    }

    const logs = await prisma.llmUsageLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });

    const totalCostUsd = logs.reduce((sum, log) => sum + (log.totalCostUsd || 0), 0);
    const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);

    return {
        logs,
        summary: {
            totalCalls: logs.length,
            totalTokens,
            totalCostUsd,
        },
    };
}

/**
 * Get project's LLM usage in AI CREDITS
 * Uses the global usdToCreditsMultiplier from SystemConfig table
 */
export async function getProjectUsageCredits(
    projectId: string,
    startDate?: Date,
    endDate?: Date
) {
    const where: any = { projectId };

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
    }

    const logs = await prisma.llmUsageLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });

    // Get Global USD to Credits Multiplier from history table
    const multiplierRecord = await prisma.creditsMultiplierHistory.findFirst({
        where: { isActive: true },
        select: { usdToCreditsMultiplier: true },
        orderBy: { effectiveFrom: 'desc' },
    });
    const multiplier = multiplierRecord?.usdToCreditsMultiplier || 100.0; // Default: 1 USD = 100 Credits

    const totalCostUsd = logs.reduce((sum, log) => sum + (log.totalCostUsd || 0), 0);
    const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);
    const totalCostCredits = totalCostUsd * multiplier;

    return {
        logs,
        summary: {
            totalCalls: logs.length,
            totalTokens,
            totalCostCredits,
        },
    };
}

/**
 * Get billing summary for all users in USD (admin function)
 */
export async function getAllUsersBillingSummary(
    startDate?: Date,
    endDate?: Date
) {
    const where: any = {};

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
    }

    const logs = await prisma.llmUsageLog.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });

    // Group by user
    const byUser = logs.reduce((acc, log) => {
        if (!acc[log.userId]) {
            acc[log.userId] = {
                user: log.user,
                totalCalls: 0,
                totalTokens: 0,
                totalCostUsd: 0,
            };
        }
        acc[log.userId].totalCalls++;
        acc[log.userId].totalTokens += log.totalTokens;
        acc[log.userId].totalCostUsd += log.totalCostUsd || 0;
        return acc;
    }, {} as Record<string, any>);

    const users = Object.values(byUser);
    const grandTotalCostUsd = users.reduce((sum: number, u: any) => sum + u.totalCostUsd, 0);

    return {
        users,
        totalUsers: users.length,
        grandTotalCostUsd,
    };
}

/**
 * Get billing summary for all users in AI CREDITS (admin function)
 * Uses the global usdToCreditsMultiplier from SystemConfig table
 */
export async function getAllUsersBillingSummaryCredits(
    startDate?: Date,
    endDate?: Date
) {
    const where: any = {};

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
    }

    // Get Global USD to Credits Multiplier from history table
    const multiplierRecord = await prisma.creditsMultiplierHistory.findFirst({
        where: { isActive: true },
        select: { usdToCreditsMultiplier: true },
        orderBy: { effectiveFrom: 'desc' },
    });
    const multiplier = multiplierRecord?.usdToCreditsMultiplier || 100.0; // Default: 1 USD = 100 Credits

    const logs = await prisma.llmUsageLog.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });

    // Group by user
    const byUser = logs.reduce((acc, log) => {
        if (!acc[log.userId]) {
            acc[log.userId] = {
                user: {
                    id: log.user.id,
                    email: log.user.email,
                    firstName: log.user.firstName,
                    lastName: log.user.lastName,
                },
                totalCalls: 0,
                totalTokens: 0,
                totalCostCredits: 0,
            };
        }
        const costUsd = log.totalCostUsd || 0;
        acc[log.userId].totalCalls++;
        acc[log.userId].totalTokens += log.totalTokens;
        // Calculate credits using global multiplier
        acc[log.userId].totalCostCredits += costUsd * multiplier;
        return acc;
    }, {} as Record<string, any>);

    const users = Object.values(byUser);
    const grandTotalCostCredits = users.reduce((sum: number, u: any) => sum + u.totalCostCredits, 0);

    return {
        users,
        totalUsers: users.length,
        grandTotalCostCredits,
    };
}


