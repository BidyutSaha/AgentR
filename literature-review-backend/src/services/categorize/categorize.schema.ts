import { z } from 'zod';

// Request schema for Paper Scoring (Stage 5+6+7 merged)
export const categorizeRequestSchema = z.object({
    userAbstract: z.string().min(10, 'User abstract must be at least 10 characters'),
    candidateAbstract: z.string().min(10, 'Candidate abstract must be at least 10 characters'),
});

export type CategorizeRequest = z.infer<typeof categorizeRequestSchema>;

// Overlap level enum
const overlapLevelSchema = z.enum(['none', 'low', 'medium', 'high']);

// C2 contribution type enum
const c2ContributionTypeSchema = z.enum([
    'methodology',
    'problem_context',
    'domain_knowledge',
    'constraint_analysis',
    'related_application',
    'theoretical_foundation'
]);

// Output schema for Paper Scoring (Stage 5+6+7 merged)
export const categorizeOutputSchema = z.object({
    // Semantic similarity metrics
    semantic_similarity: z.number().min(0).max(1),
    problem_overlap: overlapLevelSchema,
    method_overlap: overlapLevelSchema,
    domain_overlap: overlapLevelSchema,
    constraint_overlap: overlapLevelSchema,

    // Category 1: Direct Competitor
    c1_score: z.number().min(0).max(10),
    c1_justification: z.string(),
    c1_strengths: z.array(z.string()),
    c1_weaknesses: z.array(z.string()),

    // Category 2: Supporting Work
    c2_score: z.number().min(0).max(10),
    c2_justification: z.string(),
    c2_contribution_type: c2ContributionTypeSchema,
    c2_relevance_areas: z.array(z.string()),

    // Research Gap Analysis
    research_gaps: z.array(z.string()),
    user_novelty: z.string(),
});

export type CategorizeOutput = z.infer<typeof categorizeOutputSchema>;

// Full output including input abstracts (for pipeline continuity)
export const categorizeFullOutputSchema = categorizeOutputSchema.extend({
    userAbstract: z.string(),
    candidateAbstract: z.string(),
});

export type CategorizeFullOutput = z.infer<typeof categorizeFullOutputSchema>;
