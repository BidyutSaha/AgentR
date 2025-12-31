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
    const isDevelopment = process.env.NODE_ENV === 'development';

    logger.error({
        requestId: req.requestId,
        error: err.message,
        stack: err.stack,
        cause: err.cause,
    });

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        const response: ApiErrorResponse = {
            error: {
                code: ErrorCode.VALIDATION_ERROR,
                message: 'Invalid request body',
                details: err.errors,
                cause: {
                    message: err.message,
                    ...(isDevelopment && { stack: err.stack }),
                },
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
                cause: {
                    message: err.message,
                    ...(isDevelopment && { stack: err.stack }),
                },
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
            cause: {
                message: err.message || 'Unknown error',
                ...(isDevelopment && { stack: err.stack }),
            },
        },
        meta: {
            requestId: req.requestId,
            timestamp: new Date().toISOString(),
        },
    };
    res.status(500).json(response);
}
