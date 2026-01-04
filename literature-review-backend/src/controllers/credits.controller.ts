import { Request, Response, NextFunction } from 'express';
import {
    rechargeUserCredits,
    deductUserCredits,
    getUserCreditsBalance,
    getUserTransactionHistory,
    getMyCreditsBalance,
    getAllTransactions,
} from '../services/credits.service';
import logger from '../config/logger';

/**
 * Recharge AI Credits for a user (Admin only)
 * 
 * @route POST /v1/admin/credits/recharge
 * @access Admin
 */
export async function handleRechargeCredits(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { userId, amount, reason } = req.body;
        const adminId = req.userId!;

        if (!userId || !amount) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'userId and amount are required',
                },
            });
            return;
        }

        if (typeof amount !== 'number' || amount <= 0) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Amount must be a positive number',
                },
            });
            return;
        }

        const user = await rechargeUserCredits(userId, amount, adminId, reason);

        res.status(200).json({
            success: true,
            data: user,
            message: `Recharged ${amount} credits successfully`,
        });
    } catch (error) {
        logger.error('Error recharging credits:', error);
        next(error);
    }
}

/**
 * Get user's AI Credits balance (Admin only)
 * 
 * @route GET /v1/admin/credits/user/:userId
 * @access Admin
 */
export async function handleGetUserCredits(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { userId } = req.params;

        const user = await getUserCreditsBalance(userId);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        logger.error('Error getting user credits:', error);
        next(error);
    }
}

/**
 * Deduct AI Credits from a user (Admin only)
 * 
 * @route POST /v1/admin/credits/deduct
 * @access Admin
 */
export async function handleDeductCredits(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { userId, amount, reason } = req.body;
        const adminId = req.userId!;

        if (!userId || !amount) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'userId and amount are required',
                },
            });
            return;
        }

        if (typeof amount !== 'number' || amount <= 0) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Amount must be a positive number',
                },
            });
            return;
        }

        const user = await deductUserCredits(userId, amount, adminId, reason);

        res.status(200).json({
            success: true,
            data: user,
            message: `Deducted ${amount} credits successfully`,
        });
    } catch (error) {
        logger.error('Error deducting credits:', error);
        next(error);
    }
}

/**
 * Get user's transaction history (Admin only)
 * 
 * @route GET /v1/admin/credits/user/:userId/transactions
 * @access Admin
 */
export async function handleGetUserTransactions(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;

        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (req.query.startDate) {
            startDate = new Date(req.query.startDate as string);
        }

        if (req.query.endDate) {
            endDate = new Date(req.query.endDate as string);
        }

        const transactions = await getUserTransactionHistory(userId, limit, startDate, endDate);

        res.status(200).json({
            success: true,
            data: transactions,
        });
    } catch (error) {
        logger.error('Error getting user transactions:', error);
        next(error);
    }
}

/**
 * Get current user's own credits balance
 * 
 * @route GET /v1/credits/my-balance
 * @access Protected
 */
export async function handleGetMyBalance(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.userId!;

        const balance = await getMyCreditsBalance(userId);

        res.status(200).json({
            success: true,
            data: balance,
        });
    } catch (error) {
        logger.error('Error getting my balance:', error);
        next(error);
    }
}

/**
 * Get current user's transaction history
 * 
 * @route GET /v1/credits/history
 * @access Protected
 */
export async function handleGetMyTransactions(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.userId!;
        const limit = parseInt(req.query.limit as string) || 50;

        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (req.query.startDate) {
            startDate = new Date(req.query.startDate as string);
        }

        if (req.query.endDate) {
            endDate = new Date(req.query.endDate as string);
        }

        const transactions = await getUserTransactionHistory(userId, limit, startDate, endDate);

        res.status(200).json({
            success: true,
            data: transactions,
        });
    } catch (error) {
        logger.error('Error getting my transactions:', error);
        next(error);
    }
}

/**
 * Get all transactions (Admin only)
 * 
 * @route GET /v1/admin/credits/transactions
 * @access Admin
 */
export async function handleGetAllTransactions(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const limit = parseInt(req.query.limit as string) || 50;

        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (req.query.startDate) {
            startDate = new Date(req.query.startDate as string);
        }

        if (req.query.endDate) {
            endDate = new Date(req.query.endDate as string);
        }

        const transactions = await getAllTransactions(limit, startDate, endDate);

        res.status(200).json({
            success: true,
            data: transactions,
        });
    } catch (error) {
        logger.error('Error getting all transactions:', error);
        next(error);
    }
}
