import { Request, Response, NextFunction } from 'express';
import {
    getSystemConfig,
    getCurrentMultiplier,
    updateMultiplier,
    getMultiplierHistory,
    getCurrentDefaultCredits,
    updateDefaultCredits,
    getDefaultCreditsHistory,
} from '../services/systemConfig.service';
import logger from '../config/logger';

/**
 * Get current system configuration
 * 
 * @route GET /v1/admin/system-config
 * @access Admin
 */
export async function handleGetSystemConfig(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const config = await getSystemConfig();

        res.status(200).json({
            success: true,
            data: config,
        });
    } catch (error) {
        logger.error('Error getting system config:', error);
        next(error);
    }
}

/**
 * Update USD to AI Credits multiplier
 * 
 * @route POST /v1/admin/system-config/credits-multiplier
 * @access Admin
 */
export async function handleUpdateCreditsMultiplier(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { multiplier, description } = req.body;
        const adminId = req.userId!;

        if (!multiplier || typeof multiplier !== 'number') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Multiplier must be a valid number',
                },
            });
            return;
        }

        if (multiplier <= 0) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Multiplier must be greater than 0',
                },
            });
            return;
        }

        const updated = await updateMultiplier(multiplier, adminId, description);

        res.status(201).json({
            success: true,
            data: updated,
            message: `Credits multiplier updated to ${multiplier}`,
        });
    } catch (error) {
        logger.error('Error updating credits multiplier:', error);
        next(error);
    }
}

/**
 * Get multiplier change history
 * 
 * @route GET /v1/admin/system-config/credits-multiplier/history
 * @access Admin
 */
export async function handleGetMultiplierHistory(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const current = await getCurrentMultiplier();
        const history = await getMultiplierHistory();

        res.status(200).json({
            success: true,
            data: {
                current,
                history,
            },
        });
    } catch (error) {
        logger.error('Error getting multiplier history:', error);
        next(error);
    }
}

/**
 * Update default credits for new users
 * 
 * @route POST /v1/admin/system-config/default-credits
 * @access Admin
 */
export async function handleUpdateDefaultCredits(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { credits, description } = req.body;
        const adminId = req.userId!;

        if (!credits || typeof credits !== 'number') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Credits must be a valid number',
                },
            });
            return;
        }

        if (credits <= 0) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Credits must be greater than 0',
                },
            });
            return;
        }

        const updated = await updateDefaultCredits(credits, adminId, description);

        res.status(201).json({
            success: true,
            data: updated,
            message: `Default credits updated to ${credits}`,
        });
    } catch (error) {
        logger.error('Error updating default credits:', error);
        next(error);
    }
}

/**
 * Get default credits change history
 * 
 * @route GET /v1/admin/system-config/default-credits/history
 * @access Admin
 */
export async function handleGetDefaultCreditsHistory(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const current = await getCurrentDefaultCredits();
        const history = await getDefaultCreditsHistory();

        res.status(200).json({
            success: true,
            data: {
                current,
                history,
            },
        });
    } catch (error) {
        logger.error('Error getting default credits history:', error);
        next(error);
    }
}
