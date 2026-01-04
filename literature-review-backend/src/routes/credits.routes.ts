import { handleGetMyBalance } from '../controllers/credits.controller';
import { authenticate } from '../middlewares/auth';
import { Router } from 'express';

const router = Router();

/**
 * @route   GET /v1/credits/my-balance
 * @desc    Get current user's AI Credits balance
 * @access  Protected
 */
router.get(
    '/my-balance',
    authenticate,
    handleGetMyBalance
);



export default router;
