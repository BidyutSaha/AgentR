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
});

/**
 * Type inference from create schema
 */
export type CreateCandidatePaperInput = z.infer<typeof createCandidatePaperSchema>;

/**
 * Type inference from update schema
 */
export type UpdateCandidatePaperInput = z.infer<typeof updateCandidatePaperSchema>;
