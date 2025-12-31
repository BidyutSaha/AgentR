/**
 * Domain types for papers and research concepts
 */

export interface Paper {
    paperId: string;
    title: string;
    authors: string[];
    year: number;
    venue: string;
    citations: number;
    abstract: string;
    links: {
        pdf?: string;
        doi?: string;
        arxiv?: string;
    };
    source: 'arxiv' | 'semantic_scholar' | 'other';
}

export interface ResearchIntent {
    abstract: string;
    problem: string;
    methodologies: string[];
    applicationDomains: string[];
    constraints: string[];
    contributionTypes: string[];
    keywords_seed: string[];
}

export interface MatchResult {
    paperId: string;
    semantic_similarity: number;
    problem_overlap: 'high' | 'medium' | 'low';
    method_overlap: 'high' | 'medium' | 'low';
    constraint_overlap?: 'high' | 'medium' | 'low';
    note?: string;
}

export interface RankedPaper {
    paperId: string;
    score: number;
    justification: string;
}

export interface RankingOutput {
    C1: RankedPaper[];
    C2: RankedPaper[];
    rubric: {
        scoreMeaning: string;
        C1Rule: string;
        C2Rule: string;
    };
}
