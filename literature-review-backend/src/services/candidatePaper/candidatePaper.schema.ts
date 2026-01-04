import { z } from 'zod';

/**
 * Validation schema for creating a candidate paper
 */
export const createCandidatePaperSchema = z.object({
    paperTitle: z.string()
        .min(1, 'Paper title is required')
        .max(500, 'Paper title must be less than 500 characters'),

    paperAbstract: z.string()
        .min(1, 'Paper abstract is required')
        .max(10000, 'Paper abstract must be less than 10000 characters'),

    paperDownloadLink: z.string()
        .url('Paper download link must be a valid URL')
        .optional()
        .or(z.literal('')),
});

/**
 * Validation schema for updating a candidate paper
 */
export const updateCandidatePaperSchema = z.object({
    paperTitle: z.string()
        .min(1, 'Paper title is required')
        .max(500, 'Paper title must be less than 500 characters')
        .optional(),

    paperAbstract: z.string()
        .min(1, 'Paper abstract is required')
        .max(10000, 'Paper abstract must be less than 10000 characters')
        .optional(),

    paperDownloadLink: z.string()
        .url('Paper download link must be a valid URL')
        .optional()
        .or(z.literal('')),

    // LLM Fields
    isProcessedByLlm: z.boolean().optional(),
    semanticSimilarity: z.number().optional(),
    similarityModelName: z.string().optional(),

    problemOverlap: z.string().optional(),
    methodOverlap: z.string().optional(), // Added
    domainOverlap: z.string().optional(),
    constraintOverlap: z.string().optional(),

    c1Score: z.number().optional(),
    c1Justification: z.string().optional(),
    c1Strengths: z.union([z.string(), z.array(z.string())]).optional(),
    c1Weaknesses: z.union([z.string(), z.array(z.string())]).optional(),

    c2Score: z.number().optional(),
    c2Justification: z.string().optional(),
    c2ContributionType: z.string().optional(),
    c2RelevanceAreas: z.union([z.string(), z.array(z.string())]).optional(),
    c2Strengths: z.union([z.string(), z.array(z.string())]).optional(), // Added
    c2Weaknesses: z.union([z.string(), z.array(z.string())]).optional(), // Added

    researchGaps: z.union([z.string(), z.array(z.string())]).optional(),
    userNovelty: z.string().optional(),
    candidateAdvantage: z.string().optional(), // Added

    modelUsed: z.string().optional(),
    inputTokensUsed: z.number().int().optional(),
    outputTokensUsed: z.number().int().optional(),
});

/**
 * Type inference from create schema
 */
export type CreateCandidatePaperInput = z.infer<typeof createCandidatePaperSchema>;

/**
 * Type inference from update schema
 */
export type UpdateCandidatePaperInput = z.infer<typeof updateCandidatePaperSchema>;
