import { z } from 'zod';

/**
 * Project Validation Schemas
 */

// Create project schema
export const createProjectSchema = z.object({
    projectName: z
        .string()
        .min(1, 'Project name is required')
        .max(200, 'Project name must be less than 200 characters')
        .trim(),
    userIdea: z
        .string()
        .min(10, 'User idea must be at least 10 characters')
        .trim(),
});

// Update project schema
export const updateProjectSchema = z.object({
    projectName: z
        .string()
        .min(1, 'Project name is required')
        .max(200, 'Project name must be less than 200 characters')
        .trim()
        .optional(),
    userIdea: z
        .string()
        .min(10, 'User idea must be at least 10 characters')
        .trim()
        .optional(),
}).refine(
    (data) => data.projectName !== undefined || data.userIdea !== undefined,
    {
        message: 'At least one field must be provided for update',
    }
);

// Project ID param schema
export const projectIdSchema = z.object({
    projectId: z.string().uuid('Invalid project ID format'),
});

// Export types
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectIdParam = z.infer<typeof projectIdSchema>;

/**
 * Helper function to validate and format errors
 */
export function formatZodError(error: z.ZodError) {
    return {
        message: 'Validation failed',
        errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        })),
    };
}
