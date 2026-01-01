import { PrismaClient } from '@prisma/client';
import { AppError, ErrorCode } from '../../middlewares/errorHandler';
import logger from '../../config/logger';
import {
    CreateModelPricingRequest,
    UpdateModelPricingRequest,
    ListModelPricingQuery,
    ModelPricingResponse,
    ListModelPricingResponse,
} from './modelPricing.schema';

const prisma = new PrismaClient();

/**
 * Create a new LLM model pricing entry
 * When creating a new pricing, automatically mark previous "latest" as not latest
 */
export async function createModelPricing(
    data: CreateModelPricingRequest
): Promise<ModelPricingResponse> {
    try {
        logger.info({
            action: 'create_model_pricing_start',
            modelName: data.modelName,
            provider: data.provider,
        });

        // Start a transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // If this is marked as latest, unmark previous latest for same model/provider
            if (data.effectiveFrom) {
                // When setting a specific effective date, mark previous entries as not latest
                await tx.llmModelPricing.updateMany({
                    where: {
                        modelName: data.modelName,
                        provider: data.provider,
                        pricingTier: data.pricingTier || 'standard',
                        isLatest: true,
                    },
                    data: {
                        isLatest: false,
                        effectiveTo: new Date(data.effectiveFrom),
                    },
                });
            } else {
                // If no effective date specified, mark previous as not latest
                await tx.llmModelPricing.updateMany({
                    where: {
                        modelName: data.modelName,
                        provider: data.provider,
                        pricingTier: data.pricingTier || 'standard',
                        isLatest: true,
                    },
                    data: {
                        isLatest: false,
                        effectiveTo: new Date(),
                    },
                });
            }

            // Create new pricing entry
            const pricing = await tx.llmModelPricing.create({
                data: {
                    modelName: data.modelName,
                    provider: data.provider,
                    pricingTier: data.pricingTier || 'standard',
                    inputUsdCentsPerMillionTokens: data.inputUsdCentsPerMillionTokens,
                    outputUsdCentsPerMillionTokens: data.outputUsdCentsPerMillionTokens,
                    cachedInputUsdCentsPerMillionTokens: data.cachedInputUsdCentsPerMillionTokens,
                    description: data.description,
                    notes: data.notes,
                    effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : new Date(),
                    isLatest: true,
                    isActive: true,
                },
            });

            return pricing;
        });

        logger.info({
            action: 'create_model_pricing_success',
            pricingId: result.id,
        });

        return formatModelPricingResponse(result);
    } catch (error: any) {
        logger.error({
            action: 'create_model_pricing_error',
            error: error.message,
        });

        throw new AppError(
            ErrorCode.INTERNAL_ERROR,
            `Failed to create model pricing: ${error.message}`,
            500
        );
    }
}

/**
 * Get latest pricing for a specific model
 */
export async function getLatestModelPricing(
    modelName: string,
    provider: string = 'openai'
): Promise<ModelPricingResponse | null> {
    try {
        const pricing = await prisma.llmModelPricing.findFirst({
            where: {
                modelName,
                provider,
                isLatest: true,
                isActive: true,
            },
            orderBy: {
                effectiveFrom: 'desc',
            },
        });

        if (!pricing) {
            return null;
        }

        return formatModelPricingResponse(pricing);
    } catch (error: any) {
        logger.error({
            action: 'get_latest_model_pricing_error',
            modelName,
            provider,
            error: error.message,
        });

        throw new AppError(
            ErrorCode.INTERNAL_ERROR,
            `Failed to get model pricing: ${error.message}`,
            500
        );
    }
}

/**
 * List all model pricing entries with optional filters and pagination
 */
export async function listModelPricing(
    query: ListModelPricingQuery
): Promise<ListModelPricingResponse> {
    try {
        const { provider, modelName, pricingTier, isActive, isLatest, page = 1, limit = 50 } = query;

        // Build where clause
        const where: any = {};
        if (provider) where.provider = provider;
        if (modelName) where.modelName = modelName;
        if (pricingTier) where.pricingTier = pricingTier;
        if (isActive !== undefined) where.isActive = isActive === 'true';
        if (isLatest !== undefined) where.isLatest = isLatest === 'true';

        // Get total count
        const total = await prisma.llmModelPricing.count({ where });

        // Get paginated results
        const skip = (page - 1) * limit;
        const pricingEntries = await prisma.llmModelPricing.findMany({
            where,
            orderBy: [
                { modelName: 'asc' },
                { provider: 'asc' },
                { pricingTier: 'asc' },
                { effectiveFrom: 'desc' },
            ],
            skip,
            take: limit,
        });

        logger.info({
            action: 'list_model_pricing_success',
            count: pricingEntries.length,
            total,
        });

        return {
            data: pricingEntries.map(formatModelPricingResponse),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error: any) {
        logger.error({
            action: 'list_model_pricing_error',
            error: error.message,
        });

        throw new AppError(
            ErrorCode.INTERNAL_ERROR,
            `Failed to list model pricing: ${error.message}`,
            500
        );
    }
}

/**
 * Update an existing model pricing entry
 */
export async function updateModelPricing(
    id: string,
    data: UpdateModelPricingRequest
): Promise<ModelPricingResponse> {
    try {
        logger.info({
            action: 'update_model_pricing_start',
            pricingId: id,
        });

        // Check if pricing exists
        const existing = await prisma.llmModelPricing.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new AppError(
                ErrorCode.NOT_FOUND,
                'Model pricing not found',
                404
            );
        }

        // If marking as latest, unmark previous latest
        if (data.isLatest === true) {
            await prisma.llmModelPricing.updateMany({
                where: {
                    modelName: existing.modelName,
                    provider: existing.provider,
                    pricingTier: existing.pricingTier,
                    isLatest: true,
                    id: { not: id },
                },
                data: {
                    isLatest: false,
                },
            });
        }

        // Update the pricing
        const updated = await prisma.llmModelPricing.update({
            where: { id },
            data: {
                inputUsdCentsPerMillionTokens: data.inputUsdCentsPerMillionTokens,
                outputUsdCentsPerMillionTokens: data.outputUsdCentsPerMillionTokens,
                cachedInputUsdCentsPerMillionTokens: data.cachedInputUsdCentsPerMillionTokens,
                description: data.description,
                notes: data.notes,
                isActive: data.isActive,
                isLatest: data.isLatest,
                effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
            },
        });

        logger.info({
            action: 'update_model_pricing_success',
            pricingId: id,
        });

        return formatModelPricingResponse(updated);
    } catch (error: any) {
        logger.error({
            action: 'update_model_pricing_error',
            pricingId: id,
            error: error.message,
        });

        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError(
            ErrorCode.INTERNAL_ERROR,
            `Failed to update model pricing: ${error.message}`,
            500
        );
    }
}

/**
 * Delete a model pricing entry
 */
export async function deleteModelPricing(id: string): Promise<void> {
    try {
        logger.info({
            action: 'delete_model_pricing_start',
            pricingId: id,
        });

        // Check if pricing exists
        const existing = await prisma.llmModelPricing.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new AppError(
                ErrorCode.NOT_FOUND,
                'Model pricing not found',
                404
            );
        }

        // Delete the pricing
        await prisma.llmModelPricing.delete({
            where: { id },
        });

        logger.info({
            action: 'delete_model_pricing_success',
            pricingId: id,
        });
    } catch (error: any) {
        logger.error({
            action: 'delete_model_pricing_error',
            pricingId: id,
            error: error.message,
        });

        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError(
            ErrorCode.INTERNAL_ERROR,
            `Failed to delete model pricing: ${error.message}`,
            500
        );
    }
}

/**
 * Calculate cost for a given token usage
 */
export async function calculateCost(
    modelName: string,
    inputTokens: number,
    outputTokens: number,
    provider: string = 'openai'
): Promise<{
    inputCostCents: number;
    outputCostCents: number;
    totalCostCents: number;
}> {
    const pricing = await getLatestModelPricing(modelName, provider);

    if (!pricing) {
        logger.warn({
            action: 'calculate_cost_no_pricing',
            modelName,
            provider,
        });

        // Return zero cost if no pricing found
        return {
            inputCostCents: 0,
            outputCostCents: 0,
            totalCostCents: 0,
        };
    }

    // Calculate costs (pricing is per million tokens, stored in cents)
    const inputCostCents = Math.round(
        (inputTokens / 1_000_000) * pricing.inputUsdCentsPerMillionTokens
    );
    const outputCostCents = Math.round(
        (outputTokens / 1_000_000) * pricing.outputUsdCentsPerMillionTokens
    );
    const totalCostCents = inputCostCents + outputCostCents;

    return {
        inputCostCents,
        outputCostCents,
        totalCostCents,
    };
}

/**
 * Helper function to format Prisma model to API response
 */
function formatModelPricingResponse(pricing: any): ModelPricingResponse {
    return {
        id: pricing.id,
        modelName: pricing.modelName,
        provider: pricing.provider,
        pricingTier: pricing.pricingTier,
        inputUsdCentsPerMillionTokens: pricing.inputUsdCentsPerMillionTokens,
        outputUsdCentsPerMillionTokens: pricing.outputUsdCentsPerMillionTokens,
        cachedInputUsdCentsPerMillionTokens: pricing.cachedInputUsdCentsPerMillionTokens,
        isActive: pricing.isActive,
        isLatest: pricing.isLatest,
        description: pricing.description,
        notes: pricing.notes,
        effectiveFrom: pricing.effectiveFrom.toISOString(),
        effectiveTo: pricing.effectiveTo ? pricing.effectiveTo.toISOString() : null,
        createdAt: pricing.createdAt.toISOString(),
        updatedAt: pricing.updatedAt.toISOString(),
    };
}
