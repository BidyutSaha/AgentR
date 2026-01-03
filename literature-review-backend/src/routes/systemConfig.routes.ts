import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
    handleGetSystemConfig,
    handleUpdateCreditsMultiplier,
    handleGetMultiplierHistory,
    handleUpdateDefaultCredits,
    handleGetDefaultCreditsHistory,
} from '../controllers/systemConfig.controller';

const router = Router();

/**
 * @route   GET /v1/admin/system-config
 * @desc    Get current system configuration (multiplier + default credits)
 * @access  Admin
 */
router.get(
    '/',
    authenticate,
    // TODO: Add admin middleware here
    handleGetSystemConfig
);

/**
 * @route   POST /v1/admin/system-config/credits-multiplier
 * @desc    Update USD to AI Credits multiplier (creates new history entry)
 * @access  Admin
 */
router.post(
    '/credits-multiplier',
    authenticate,
    // TODO: Add admin middleware here
    handleUpdateCreditsMultiplier
);

/**
 * @route   GET /v1/admin/system-config/credits-multiplier/history
 * @desc    Get multiplier change history
 * @access  Admin
 */
router.get(
    '/credits-multiplier/history',
    authenticate,
    // TODO: Add admin middleware here
    handleGetMultiplierHistory
);

/**
 * @route   POST /v1/admin/system-config/default-credits
 * @desc    Update default credits for new users (creates new history entry)
 * @access  Admin
 */
router.post(
    '/default-credits',
    authenticate,
    // TODO: Add admin middleware here
    handleUpdateDefaultCredits
);

/**
 * @route   GET /v1/admin/system-config/default-credits/history
 * @desc    Get default credits change history
 * @access  Admin
 */
router.get(
    '/default-credits/history',
    authenticate,
    // TODO: Add admin middleware here
    handleGetDefaultCreditsHistory
);

export default router;
