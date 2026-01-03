import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Middleware to check if user has sufficient AI Credits before making LLM calls
 * Returns 402 Payment Required if credits are exhausted
 */
export async function checkCreditsMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.userId!;

        // Get user's current credit balance
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                aiCreditsBalance: true,
                email: true,
            },
        });

        if (!user) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                },
            });
            return;
        }

        // Check if user has credits
        if (user.aiCreditsBalance <= 0) {
            logger.warn(`User ${user.email} attempted LLM call with insufficient credits: ${user.aiCreditsBalance}`);

            res.status(402).json({
                success: false,
                error: {
                    code: 'INSUFFICIENT_CREDITS',
                    message: 'AI Credits exhausted. Please recharge your account to continue using LLM features.',
                    details: {
                        currentBalance: user.aiCreditsBalance,
                        requiredAction: 'Contact admin to recharge credits',
                    },
                },
            });
            return;
        }

        // User has credits, proceed
        next();
    } catch (error) {
        logger.error('Error checking credits:', error);
        next(error);
    }
}
