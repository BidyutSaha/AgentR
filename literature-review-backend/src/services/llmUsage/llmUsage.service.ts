import prisma from '../../config/database';
import logger from '../../config/logger';

/**
 * LLM Usage Tracking Service
 * 
 * Tracks all LLM API calls for billing and analytics purposes.
 * Captures model, tokens, cost, duration, and other metadata.
 */

// Pricing per 1M tokens (in cents) - Update these based on current OpenAI pricing
const MODEL_PRICING = {
    'gpt-4o-mini': {
        input: 15,      // $0.15 per 1M input tokens
        output: 60,     // $0.60 per 1M output tokens
    },
    'gpt-4o': {
        input: 250,     // $2.50 per 1M input tokens
        output: 1000,   // $10.00 per 1M output tokens
    },
    'gpt-4-turbo': {
        input: 1000,    // $10.00 per 1M input tokens
        output: 3000,   // $30.00 per 1M output tokens
    },
    'gpt-4': {
        input: 3000,    // $30.00 per 1M input tokens
        output: 6000,   // $60.00 per 1M output tokens
    },
    'gpt-3.5-turbo': {
        input: 50,      // $0.50 per 1M input tokens
        output: 150,    // $1.50 per 1M output tokens
    },
} as const;

type ModelName = keyof typeof MODEL_PRICING;

/**
 * Calculate cost in cents for token usage
 */
function calculateCost(modelName: string, inputTokens: number, outputTokens: number) {
    const pricing = MODEL_PRICING[modelName as ModelName];

    if (!pricing) {
        logger.warn(`Unknown model pricing for: ${modelName}`);
        return { inputCostCents: null, outputCostCents: null, totalCostCents: null };
    }

    // Cost = (tokens / 1,000,000) * price_per_million
    const inputCostCents = Math.round((inputTokens / 1_000_000) * pricing.input);
    const outputCostCents = Math.round((outputTokens / 1_000_000) * pricing.output);
    const totalCostCents = inputCostCents + outputCostCents;

    return { inputCostCents, outputCostCents, totalCostCents };
}

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
        const costs = calculateCost(data.modelName, data.inputTokens, data.outputTokens);

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
                inputCostCents: costs.inputCostCents,
                outputCostCents: costs.outputCostCents,
                totalCostCents: costs.totalCostCents,
                durationMs: data.durationMs,
                requestId: data.requestId,
                status: data.status || 'success',
                errorMessage: data.errorMessage,
                metadata: data.metadata ? JSON.stringify(data.metadata) : null,
            },
        });

        logger.info(`LLM usage logged: ${log.id} - ${data.stage} - ${totalTokens} tokens - $${(costs.totalCostCents || 0) / 100}`);

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
    const totalCostCents = logs.reduce((sum, log) => sum + (log.totalCostCents || 0), 0);

    // Group by stage
    const byStage = logs.reduce((acc, log) => {
        if (!acc[log.stage]) {
            acc[log.stage] = {
                count: 0,
                totalTokens: 0,
                totalCostCents: 0,
            };
        }
        acc[log.stage].count++;
        acc[log.stage].totalTokens += log.totalTokens;
        acc[log.stage].totalCostCents += log.totalCostCents || 0;
        return acc;
    }, {} as Record<string, { count: number; totalTokens: number; totalCostCents: number }>);

    // Group by model
    const byModel = logs.reduce((acc, log) => {
        if (!acc[log.modelName]) {
            acc[log.modelName] = {
                count: 0,
                totalTokens: 0,
                totalCostCents: 0,
            };
        }
        acc[log.modelName].count++;
        acc[log.modelName].totalTokens += log.totalTokens;
        acc[log.modelName].totalCostCents += log.totalCostCents || 0;
        return acc;
    }, {} as Record<string, { count: number; totalTokens: number; totalCostCents: number }>);

    return {
        logs,
        summary: {
            totalCalls: logs.length,
            totalInputTokens,
            totalOutputTokens,
            totalTokens,
            totalCostCents,
            totalCostUsd: totalCostCents / 100,
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

    const totalCostCents = logs.reduce((sum, log) => sum + (log.totalCostCents || 0), 0);
    const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);

    return {
        logs,
        summary: {
            totalCalls: logs.length,
            totalTokens,
            totalCostCents,
            totalCostUsd: totalCostCents / 100,
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
                totalCostCents: 0,
            };
        }
        acc[log.userId].totalCalls++;
        acc[log.userId].totalTokens += log.totalTokens;
        acc[log.userId].totalCostCents += log.totalCostCents || 0;
        return acc;
    }, {} as Record<string, any>);

    return Object.values(byUser).map((user: any) => ({
        ...user,
        totalCostUsd: user.totalCostCents / 100,
    }));
}
