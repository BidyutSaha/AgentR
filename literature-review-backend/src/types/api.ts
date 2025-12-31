/**
 * Common API types for request/response envelopes
 */

export interface ApiSuccessResponse<T = any> {
    data: T;
    meta: {
        requestId: string;
        timestamp?: string;
    };
}

export interface ApiErrorResponse {
    error: {
        code: string;
        message: string;
        details?: any;
    };
    meta: {
        requestId: string;
        timestamp?: string;
    };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Stage output envelope (required for every stage)
 */
export interface StageOutput<TInput = any, TOutput = any> {
    stage: 'intent' | 'queries' | 'retrieval' | 'filter' | 'score' | 'rank' | 'gaps';
    version: string;
    generatedAt: string;
    input?: TInput;
    output: TOutput;
}

/**
 * Error codes
 */
export enum ErrorCode {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    UPSTREAM_ERROR = 'UPSTREAM_ERROR',
    LLM_ERROR = 'LLM_ERROR',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
}
