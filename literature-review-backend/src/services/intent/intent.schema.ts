import { z } from 'zod';

// Request schema for Stage 1: Intent Decomposition
export const intentRequestSchema = z.object({
    abstract: z.string().min(10, 'Abstract must be at least 10 characters'),
});

export type IntentRequest = z.infer<typeof intentRequestSchema>;

// Output schema for Stage 1
export const intentOutputSchema = z.object({
    abstract: z.string(),
    problem: z.string(),
    methodologies: z.array(z.string()),
    applicationDomains: z.array(z.string()),
    constraints: z.array(z.string()),
    contributionTypes: z.array(z.string()),
    keywords_seed: z.array(z.string()),
});

export type IntentOutput = z.infer<typeof intentOutputSchema>;
