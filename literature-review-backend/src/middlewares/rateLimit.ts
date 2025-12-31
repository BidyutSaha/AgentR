import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate Limiting Middleware
 * Prevents brute force attacks and abuse
 */

/**
 * Standard rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests, please try again later',
        },
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    skip: (req: Request) => {
        // Skip rate limiting in test environment
        return process.env.NODE_ENV === 'test';
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            error: {
                code: 'TOO_MANY_REQUESTS',
                message: 'Too many authentication attempts. Please try again in 15 minutes.',
            },
        });
    },
});

/**
 * Strict rate limiter for login endpoint
 * 3 requests per 15 minutes per IP
 * More restrictive to prevent brute force password attacks
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 requests per window
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_LOGIN_ATTEMPTS',
            message: 'Too many login attempts, please try again later',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => {
        return process.env.NODE_ENV === 'test';
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            error: {
                code: 'TOO_MANY_LOGIN_ATTEMPTS',
                message: 'Too many login attempts. Please try again in 15 minutes.',
            },
        });
    },
});

/**
 * Moderate rate limiter for password reset
 * 3 requests per hour per IP
 */
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per window
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_RESET_ATTEMPTS',
            message: 'Too many password reset attempts, please try again later',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => {
        return process.env.NODE_ENV === 'test';
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            error: {
                code: 'TOO_MANY_RESET_ATTEMPTS',
                message: 'Too many password reset attempts. Please try again in 1 hour.',
            },
        });
    },
});

/**
 * Lenient rate limiter for email verification
 * 10 requests per hour per IP
 */
export const verificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per window
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_VERIFICATION_ATTEMPTS',
            message: 'Too many verification attempts, please try again later',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => {
        return process.env.NODE_ENV === 'test';
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            error: {
                code: 'TOO_MANY_VERIFICATION_ATTEMPTS',
                message: 'Too many verification attempts. Please try again in 1 hour.',
            },
        });
    },
});

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests, please try again later',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => {
        return process.env.NODE_ENV === 'test';
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            error: {
                code: 'TOO_MANY_REQUESTS',
                message: 'Too many requests. Please try again in 15 minutes.',
            },
        });
    },
});
