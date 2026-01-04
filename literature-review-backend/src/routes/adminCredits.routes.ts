import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
    handleRechargeCredits,
    handleDeductCredits,
    handleGetUserCredits,
    handleGetUserTransactions,
    handleGetAllTransactions,
} from '../controllers/credits.controller';

const router = Router();

/**
 * @route   POST /v1/admin/credits/recharge
 * @desc    Recharge AI Credits for a user
 * @access  Admin
 */
router.post(
    '/recharge',
    authenticate,
    // TODO: Add admin middleware here
    handleRechargeCredits
);

/**
 * @route   POST /v1/admin/credits/deduct
 * @desc    Deduct AI Credits from a user
 * @access  Admin
 */
router.post(
    '/deduct',
    authenticate,
    // TODO: Add admin middleware here
    handleDeductCredits
);

/**
 * @route   GET /v1/admin/credits/user/:userId
 * @desc    Get user's AI Credits balance
 * @access  Admin
 */
router.get(
    '/user/:userId',
    authenticate,
    // TODO: Add admin middleware here
    handleGetUserCredits
);

/**
 * @route   GET /v1/admin/credits/user/:userId/wallet-transaction-history
 * @desc    Get user's wallet transaction history
 * @access  Admin
 */
router.get(
    '/user/:userId/wallet-transaction-history',
    authenticate,
    // TODO: Add admin middleware here
    handleGetUserTransactions
);

/**
 * @route   GET /v1/admin/credits/wallet-transaction-history
 * @desc    Get all wallet transaction history (global)
 * @access  Admin
 */
router.get(
    '/wallet-transaction-history',
    authenticate,
    // TODO: Add admin middleware here
    handleGetAllTransactions
);

export default router;
