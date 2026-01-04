import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';
import { calculateCost } from './modelPricing/modelPricing.service';
// import { deductCreditsFromUser } from './llmUsage/llmUsage.service';

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
    console.log('!!! LOGGING USAGE & DEDUCTING (Updated for ACID) !!!', params.stage);
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
        // This read is outside TX, which is acceptable as pricing changes are rare and low impact if slightly stale
        const { inputCostUsd, outputCostUsd, totalCostUsd } = await calculateCost(
            modelName,
            inputTokens,
            outputTokens,
            provider
        );

        // START TRANSACTION - ACID Compliance Enforced Here
        await prisma.$transaction(async (tx) => {
            // 1. Create usage log entry
            // Use 'tx' instead of 'prisma'
            const logEntry = await tx.llmUsageLog.create({
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

            // 2. Deduct AI Credits (Inline Validated Logic)
            // Get current USD to Credits multiplier from history table
            const multiplierRecord = await tx.creditsMultiplierHistory.findFirst({
                where: { isActive: true },
                select: { usdToCreditsMultiplier: true },
                orderBy: { effectiveFrom: 'desc' },
            });
            const multiplier = multiplierRecord?.usdToCreditsMultiplier || 100.0;

            // Calculate credits to deduct
            const creditsToDeduct = totalCostUsd * multiplier;

            if (creditsToDeduct > 0) {
                // Deduct from user balance
                // Using 'tx' ensures this only happens if the log is created successfully
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        aiCreditsBalance: {
                            decrement: creditsToDeduct,
                        },
                    },
                });

                // Optional: Log transaction explicitly to ledger if required by strict auditing
                // For now, we update the balance directly as per original flow, but securely.
                // If you need a "UserCreditsTransaction" record for *every* LLM call, enable the code below.
                // Currently, the request was just for "ACID property", which this transaction satisfies.
            }

            logger.info({
                action: 'llm_usage_logged',
                logId: logEntry.id,
                userId,
                stage,
                modelName,
                totalCostUsd: totalCostUsd.toFixed(6),
                creditsDeducted: creditsToDeduct.toFixed(4)
            });
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
