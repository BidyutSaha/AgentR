import { z } from 'zod';

// Request schema for Stage 2: Query Generation
// Takes the output from Stage 1 directly
export const queriesRequestSchema = z.object({
    abstract: z.string(),
    problem: z.string(),
    methodologies: z.array(z.string()),
    applicationDomains: z.array(z.string()),
    constraints: z.array(z.string()),
    contributionTypes: z.array(z.string()),
    keywords_seed: z.array(z.string()),
    projectId: z.string().uuid().optional(), // Optional: for tracking LLM usage per project
    paperId: z.string().uuid().optional(), // Optional: for tracking LLM usage per paper
});

export type QueriesRequest = z.infer<typeof queriesRequestSchema>;

// Output schema for Stage 2
export const queriesOutputSchema = z.object({
    abstract: z.string(),
    booleanQuery: z.string(),
    expandedKeywords: z.array(z.string()),
    engineQueries: z.object({
        arxiv: z.string(),
        semanticScholar: z.string(),
    }),
});

export type QueriesOutput = z.infer<typeof queriesOutputSchema>;
