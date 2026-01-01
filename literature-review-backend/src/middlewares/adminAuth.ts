import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

/**
 * Admin-only middleware
 * Must be used after authenticate middleware
 * 
 * For now, checks if user email matches admin emails from env
 * In future, can be extended to check user.role === 'admin'
 * 
 * Usage:
 * router.post('/admin-only', authenticate, requireAdmin, controller)
 */
export function requireAdmin(
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

    // Get admin emails from environment variable (comma-separated)
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];

    // Check if user email is in admin list
    const isAdmin = adminEmails.includes(req.user.email);

    if (!isAdmin) {
        logger.warn({
            action: 'admin_access_denied',
            userId: req.user.id,
            email: req.user.email,
        });

        res.status(403).json({
            success: false,
            error: {
                code: 'FORBIDDEN',
                message: 'Admin access required',
            },
        });
        return;
    }

    logger.info({
        action: 'admin_access_granted',
        userId: req.user.id,
        email: req.user.email,
    });

    next();
}
