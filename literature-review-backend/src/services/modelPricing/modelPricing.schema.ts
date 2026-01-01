import { z } from 'zod';

/**
 * Schema for creating a new LLM model pricing entry
 */
export const createModelPricingSchema = z.object({
    modelName: z.string().min(1, 'Model name is required').max(100),
    provider: z.string().min(1, 'Provider is required').max(50).default('openai'),
    pricingTier: z.enum(['batch', 'flex', 'standard', 'priority']).default('standard'),

    // Pricing in USD dollars per million tokens (Float)
    inputUsdPricePerMillionTokens: z.number().min(0, 'Input price must be non-negative'),
    outputUsdPricePerMillionTokens: z.number().min(0, 'Output price must be non-negative'),
    cachedInputUsdPricePerMillionTokens: z.number().min(0).nullable().optional(),

    description: z.string().max(500).optional(),
    notes: z.string().max(1000).nullable().optional(),
    effectiveFrom: z.string().datetime().optional(), // ISO 8601 datetime string
});

export type CreateModelPricingRequest = z.infer<typeof createModelPricingSchema>;

/**
 * Schema for updating an existing LLM model pricing entry
 */
export const updateModelPricingSchema = z.object({
    inputUsdPricePerMillionTokens: z.number().min(0).optional(),
    outputUsdPricePerMillionTokens: z.number().min(0).optional(),
    cachedInputUsdPricePerMillionTokens: z.number().min(0).nullable().optional(),
    description: z.string().max(500).optional(),
    notes: z.string().max(1000).nullable().optional(),
    isActive: z.boolean().optional(),
    isLatest: z.boolean().optional(),
    effectiveTo: z.string().datetime().nullable().optional(),
});

export type UpdateModelPricingRequest = z.infer<typeof updateModelPricingSchema>;

/**
 * Schema for query parameters when listing model pricing
 */
export const listModelPricingQuerySchema = z.object({
    provider: z.string().optional(),
    modelName: z.string().optional(),
    pricingTier: z.enum(['batch', 'flex', 'standard', 'priority']).optional(),
    isActive: z.enum(['true', 'false']).optional(),
    isLatest: z.enum(['true', 'false']).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('50'),
});

export type ListModelPricingQuery = z.infer<typeof listModelPricingQuerySchema>;

/**
 * Response schema for a single model pricing entry
 */
export interface ModelPricingResponse {
    id: string;
    modelName: string;
    provider: string;
    pricingTier: string;
    inputUsdPricePerMillionTokens: number;
    outputUsdPricePerMillionTokens: number;
    cachedInputUsdPricePerMillionTokens: number | null;
    isActive: boolean;
    isLatest: boolean;
    description: string | null;
    notes: string | null;
    effectiveFrom: string; // ISO 8601
    effectiveTo: string | null; // ISO 8601
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
}

/**
 * Response schema for listing model pricing with pagination
 */
export interface ListModelPricingResponse {
    data: ModelPricingResponse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
