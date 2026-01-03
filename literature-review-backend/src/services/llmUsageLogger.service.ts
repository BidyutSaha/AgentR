import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';
import { calculateCost } from './modelPricing/modelPricing.service';
import { deductCreditsFromUser } from './llmUsage/llmUsage.service';

const prisma = new PrismaClient();

/**
 * Interface for LLM usage logging
 */
export interface LogLlmUsageParams {
    userId: string;
    stage: 'intent' | 'queries' | 'score' | string;
    modelName: string;
    provider?: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    projectId?: string;
    paperId?: string;
    durationMs?: number;
    requestId?: string;
    status?: 'success' | 'error' | 'timeout';
    errorMessage?: string;
    metadata?: Record<string, any>;
}

/**
 * Log LLM usage with automatic cost calculation
 * This function should be called after every LLM API call
 */
export async function logLlmUsage(params: LogLlmUsageParams): Promise<void> {
    console.log('!!! LOGGING USAGE & DEDUCTING !!!', params.stage);
    try {
        const {
            userId,
            stage,
            modelName,
            provider = 'openai',
            inputTokens,
            outputTokens,
            totalTokens,
            projectId,
            paperId,
            durationMs,
            requestId,
            status = 'success',
            errorMessage,
            metadata,
        } = params;

        // Calculate cost from pricing table (returns floats in USD)
        const { inputCostUsd, outputCostUsd, totalCostUsd } = await calculateCost(
            modelName,
            inputTokens,
            outputTokens,
            provider
        );

        // Create usage log entry
        await prisma.llmUsageLog.create({
            data: {
                userId,
                projectId: projectId || null,
                paperId: paperId || null,
                stage,
                modelName,
                provider,
                inputTokens,
                outputTokens,
                totalTokens,
                inputCostUsd,
                outputCostUsd,
                totalCostUsd,
                durationMs: durationMs || null,
                requestId: requestId || null,
                status,
                errorMessage: errorMessage || null,
                metadata: metadata ? JSON.stringify(metadata) : null,
            },
        });

        // Deduct AI Credits
        await deductCreditsFromUser(userId, totalCostUsd);

        logger.info({
            action: 'llm_usage_logged',
            userId,
            stage,
            modelName,
            inputTokens,
            outputTokens,
            totalCostUsd: totalCostUsd.toFixed(6), // Log with precision
        });
    } catch (error: any) {
        logger.error({
            action: 'llm_usage_logging_error',
            error: error.message,
            params,
        });
        // Don't throw - logging failure shouldn't break the main flow
    }
}

/**
 * Get total cost for a user (in USD)
 */
export async function getUserTotalCost(userId: string): Promise<number> {
    const result = await prisma.llmUsageLog.aggregate({
        where: { userId },
        _sum: {
            totalCostUsd: true,
        },
    });

    return result._sum.totalCostUsd || 0;
}

/**
 * Get total cost for a project (in USD)
 */
export async function getProjectTotalCost(projectId: string): Promise<number> {
    const result = await prisma.llmUsageLog.aggregate({
        where: { projectId },
        _sum: {
            totalCostUsd: true,
        },
    });

    return result._sum.totalCostUsd || 0;
}

/**
 * Get usage statistics for a user
 */
export async function getUserUsageStats(userId: string) {
    const stats = await prisma.llmUsageLog.groupBy({
        by: ['stage', 'modelName'],
        where: { userId },
        _sum: {
            inputTokens: true,
            outputTokens: true,
            totalTokens: true,
            totalCostUsd: true,
        },
        _count: {
            id: true,
        },
    });

    return stats.map((stat) => ({
        stage: stat.stage,
        modelName: stat.modelName,
        totalCalls: stat._count.id,
        totalInputTokens: stat._sum.inputTokens || 0,
        totalOutputTokens: stat._sum.outputTokens || 0,
        totalTokens: stat._sum.totalTokens || 0,
        totalCostUsd: (stat._sum.totalCostUsd || 0),
    }));
}
