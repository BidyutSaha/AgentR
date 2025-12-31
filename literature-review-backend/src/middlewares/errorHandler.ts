import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '../config/logger';
import { ApiErrorResponse, ErrorCode } from '../types/api';

export { ErrorCode } from '../types/api';

export class AppError extends Error {
    constructor(
        public code: ErrorCode,
        public message: string,
        public statusCode: number = 500,
        public details?: any
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    logger.error({
        requestId: req.requestId,
        error: err.message,
        stack: err.stack,
    });

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        const response: ApiErrorResponse = {
            error: {
                code: ErrorCode.VALIDATION_ERROR,
                message: 'Invalid request body',
                details: err.errors,
            },
            meta: {
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
            },
        };
        res.status(400).json(response);
        return;
    }

    // Handle custom AppError
    if (err instanceof AppError) {
        const response: ApiErrorResponse = {
            error: {
                code: err.code,
                message: err.message,
                details: err.details,
            },
            meta: {
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
            },
        };
        res.status(err.statusCode).json(response);
        return;
    }

    // Handle unknown errors
    const response: ApiErrorResponse = {
        error: {
            code: ErrorCode.INTERNAL_ERROR,
            message: 'An unexpected error occurred',
        },
        meta: {
            requestId: req.requestId,
            timestamp: new Date().toISOString(),
        },
    };
    res.status(500).json(response);
}
