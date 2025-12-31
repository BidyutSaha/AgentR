import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';
import {
    authLimiter,
    loginLimiter,
    passwordResetLimiter,
    verificationLimiter,
} from '../middlewares/rateLimit';

const router = Router();

/**
 * Authentication Routes
 * Base path: /v1/auth
 */

// ============================================================================
// Public Routes
// ============================================================================

/**
 * @route   POST /v1/auth/register
 * @desc    Register a new user
 * @access  Public
 * @rateLimit 5 requests per 15 minutes
 */
router.post('/register', authLimiter, authController.register);

/**
 * @route   POST /v1/auth/login
 * @desc    Login user
 * @access  Public
 * @rateLimit 3 requests per 15 minutes
 */
router.post('/login', loginLimiter, authController.login);

/**
 * @route   GET /v1/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 * @query   token - Verification token
 * @rateLimit 10 requests per hour
 */
router.get('/verify-email', verificationLimiter, authController.verifyEmail);

/**
 * @route   POST /v1/auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 * @body    email - User email
 * @rateLimit 10 requests per hour
 */
router.post('/resend-verification', verificationLimiter, authController.resendVerification);

/**
 * @route   POST /v1/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 * @body    email - User email
 * @rateLimit 3 requests per hour
 */
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);

/**
 * @route   POST /v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 * @body    token - Reset token
 * @body    newPassword - New password
 * @rateLimit 3 requests per hour
 */
router.post('/reset-password', passwordResetLimiter, authController.resetPassword);

/**
 * @route   POST /v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 * @body    refreshToken - Refresh token
 * @rateLimit 5 requests per 15 minutes
 */
router.post('/refresh', authLimiter, authController.refreshToken);

/**
 * @route   POST /v1/auth/logout
 * @desc    Logout user (revoke refresh token)
 * @access  Public
 * @body    refreshToken - Refresh token to revoke
 * @rateLimit 5 requests per 15 minutes
 */
router.post('/logout', authLimiter, authController.logout);

// ============================================================================
// Protected Routes (Require Authentication)
// ============================================================================

/**
 * @route   GET /v1/auth/profile
 * @desc    Get user profile
 * @access  Private
 * @header  Authorization: Bearer <access_token>
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route   POST /v1/auth/change-password
 * @desc    Change password (for logged-in users)
 * @access  Private
 * @header  Authorization: Bearer <access_token>
 * @body    currentPassword - Current password
 * @body    newPassword - New password
 * @rateLimit 5 requests per 15 minutes
 */
router.post('/change-password', authenticate, authLimiter, authController.changePassword);

export default router;
