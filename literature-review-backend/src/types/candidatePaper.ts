/**
 * Candidate Paper Types
 * 
 * Types for candidate papers that users add to their research projects
 * for analysis and comparison.
 */

/**
 * Overlap level for problem, domain, and constraint analysis
 */
export type OverlapLevel = 'high' | 'medium' | 'low';

/**
 * Candidate paper entity from database
 */
export interface CandidatePaper {
    id: string;
    projectId: string;

    // Basic Paper Info
    paperTitle: string;
    paperAbstract: string;
    paperDownloadLink: string | null;

    // LLM Processing Status
    isProcessedByLlm: boolean;

    // Semantic Similarity
    semanticSimilarity: number | null;
    similarityModelName: string | null;

    // Overlap Analysis
    problemOverlap: OverlapLevel | null;
    domainOverlap: OverlapLevel | null;
    constraintOverlap: OverlapLevel | null;

    // C1 Scoring (Competitor Analysis)
    c1Score: number | null;
    c1Justification: string | null;
    c1Strengths: string | null;
    c1Weaknesses: string | null;

    // C2 Scoring (Supporting Work Analysis)
    c2Score: number | null;
    c2Justification: string | null;
    c2ContributionType: string | null;
    c2RelevanceAreas: string | null;

    // Gap Analysis
    researchGaps: string | null;
    userNovelty: string | null;

    // LLM Metadata
    modelUsed: string | null;
    inputTokensUsed: number | null;
    outputTokensUsed: number | null;
    processedAt: Date | null;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Request to create a new candidate paper
 */
export interface CreateCandidatePaperRequest {
    paperTitle: string;
    paperAbstract: string;
    paperDownloadLink?: string;
}

/**
 * Response when creating a candidate paper
 */
export interface CreateCandidatePaperResponse {
    paper: CandidatePaper;
}

/**
 * Safe candidate paper (for API responses)
 * Converts Decimal types to numbers
 */
export interface SafeCandidatePaper extends Omit<CandidatePaper, 'semanticSimilarity' | 'c1Score' | 'c2Score'> {
    semanticSimilarity: number | null;
    c1Score: number | null;
    c2Score: number | null;
}
