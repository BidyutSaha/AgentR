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
 * Log an LLM API call for billing tracking
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

        logger.info(`LLM usage logged: ${log.id} - ${data.stage} - ${totalTokens} tokens - $${costs.totalCostUsd.toFixed(6)}`);

        return log;
    } catch (error) {
        logger.error('Error logging LLM usage:', error);
        // Don't throw - we don't want billing tracking to break the main flow
        return null;
    }
}

/**
 * Get user's LLM usage for a specific time period
 */
export async function getUserUsage(
    userId: string,
    startDate?: Date,
    endDate?: Date
) {
    const where: any = { userId };

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
    }

    const logs = await prisma.llmUsageLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    const totalInputTokens = logs.reduce((sum, log) => sum + log.inputTokens, 0);
    const totalOutputTokens = logs.reduce((sum, log) => sum + log.outputTokens, 0);
    const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);
    const totalCostUsd = logs.reduce((sum, log) => sum + (log.totalCostUsd || 0), 0);

    // Group by stage
    const byStage = logs.reduce((acc, log) => {
        if (!acc[log.stage]) {
            acc[log.stage] = {
                count: 0,
                totalTokens: 0,
                totalCostUsd: 0,
            };
        }
        acc[log.stage].count++;
        acc[log.stage].totalTokens += log.totalTokens;
        acc[log.stage].totalCostUsd += log.totalCostUsd || 0;
        return acc;
    }, {} as Record<string, { count: number; totalTokens: number; totalCostUsd: number }>);

    // Group by model
    const byModel = logs.reduce((acc, log) => {
        if (!acc[log.modelName]) {
            acc[log.modelName] = {
                count: 0,
                totalTokens: 0,
                totalCostUsd: 0,
            };
        }
        acc[log.modelName].count++;
        acc[log.modelName].totalTokens += log.totalTokens;
        acc[log.modelName].totalCostUsd += log.totalCostUsd || 0;
        return acc;
    }, {} as Record<string, { count: number; totalTokens: number; totalCostUsd: number }>);

    return {
        logs,
        summary: {
            totalCalls: logs.length,
            totalInputTokens,
            totalOutputTokens,
            totalTokens,
            totalCostUsd, // Is already float USD
            byStage,
            byModel,
        },
    };
}

/**
 * Get project's LLM usage
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
 * Get billing summary for all users (admin function)
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
                totalCostUsd: 0, // USD
            };
        }
        acc[log.userId].totalCalls++;
        acc[log.userId].totalTokens += log.totalTokens;
        acc[log.userId].totalCostUsd += log.totalCostUsd || 0;
        return acc;
    }, {} as Record<string, any>);

    return Object.values(byUser);
}
