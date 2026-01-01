/**
 * Common API types for request/response envelopes
 */

export interface ApiSuccessResponse<T = any> {
    data: T;
    meta: {
        requestId: string;
        timestamp?: string;
        pagination?: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export interface ApiErrorResponse {
    error: {
        code: string;
        message: string;
        details?: any;
        cause?: {
            message: string;
            stack?: string;
        };
    };
    meta: {
        requestId: string;
        timestamp?: string;
    };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * LLM usage metadata for tracking tokens and costs
 */
export interface LlmUsageMetadata {
    modelName: string;           // e.g., 'gpt-4o-mini'
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    durationMs?: number;         // API call duration
    requestId?: string;          // OpenAI request ID
}

/**
 * Stage output envelope (required for every stage)
 */
export interface StageOutput<TInput = any, TOutput = any> {
    stage: 'intent' | 'queries' | 'retrieval' | 'filter' | 'score' | 'rank' | 'gaps';
    version: string;
    generatedAt: string;
    input?: TInput;
    output: TOutput;
    usage?: LlmUsageMetadata;    // LLM usage tracking
}

/**
 * Error codes
 */
export enum ErrorCode {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    UPSTREAM_ERROR = 'UPSTREAM_ERROR',
    LLM_ERROR = 'LLM_ERROR',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    NOT_FOUND = 'NOT_FOUND',
}
