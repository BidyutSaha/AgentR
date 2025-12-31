import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/auth/token.service';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user to request
 */

/**
 * Extract token from Authorization header
 * Supports: "Bearer <token>" format
 */
function extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return null;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
}

/**
 * Authenticate middleware
 * Verifies JWT access token and attaches user to request
 * 
 * Usage:
 * router.get('/protected', authenticate, controller)
 */
export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        // Extract token
        const token = extractToken(req);

        if (!token) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'No authentication token provided',
                },
            });
            return;
        }

        // Verify token
        let payload;
        try {
            payload = verifyAccessToken(token);
        } catch (error) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: error instanceof Error ? error.message : 'Invalid token',
                },
            });
            return;
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isVerified: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                lastLogin: true,
            },
        });

        if (!user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                },
            });
            return;
        }

        if (!user.isActive) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'ACCOUNT_DEACTIVATED',
                    message: 'Account has been deactivated',
                },
            });
            return;
        }

        // Attach user to request
        req.user = user;
        req.userId = user.id;

        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Authentication failed',
            },
        });
    }
}

/**
 * Require verified email middleware
 * Must be used after authenticate middleware
 * 
 * Usage:
 * router.get('/protected', authenticate, requireVerified, controller)
 */
export function requireVerified(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            },
        });
        return;
    }

    if (!req.user.isVerified) {
        res.status(403).json({
            success: false,
            error: {
                code: 'EMAIL_NOT_VERIFIED',
                message: 'Please verify your email address first',
            },
        });
        return;
    }

    next();
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 * 
 * Usage:
 * router.get('/public-or-private', optionalAuth, controller)
 */
export async function optionalAuth(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const token = extractToken(req);

        if (!token) {
            next();
            return;
        }

        try {
            const payload = verifyAccessToken(token);

            const user = await prisma.user.findUnique({
                where: { id: payload.userId },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    isVerified: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                    lastLogin: true,
                },
            });

            if (user && user.isActive) {
                req.user = user;
                req.userId = user.id;
            }
        } catch (error) {
            // Invalid token, but that's okay for optional auth
            logger.debug('Optional auth: Invalid token');
        }

        next();
    } catch (error) {
        logger.error('Optional auth error:', error);
        next(); // Continue even if there's an error
    }
}
