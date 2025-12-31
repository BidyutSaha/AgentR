import { Request, Response } from 'express';
import * as authService from '../services/auth/auth.service';
import {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    resendVerificationSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
    refreshTokenSchema,
    logoutSchema,
    formatZodError,
} from '../services/auth/auth.schema';
import { ZodError } from 'zod';
import logger from '../config/logger';

/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */

/**
 * Register a new user
 * POST /v1/auth/register
 */
export async function register(req: Request, res: Response): Promise<void> {
    try {
        // Validate request body
        const data = registerSchema.parse(req.body);

        // Register user
        const result = await authService.register(data);

        res.status(201).json({
            success: true,
            data: result,
            message: 'Registration successful. Please check your email to verify your account.',
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                error: formatZodError(error),
            });
            return;
        }

        logger.error('Registration error:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'REGISTRATION_FAILED',
                message: error instanceof Error ? error.message : 'Registration failed',
            },
        });
    }
}

/**
 * Login user
 * POST /v1/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
    try {
        // Validate request body
        const data = loginSchema.parse(req.body);

        // Login user
        const result = await authService.login(data);

        res.status(200).json({
            success: true,
            data: result,
            message: 'Login successful',
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                error: formatZodError(error),
            });
            return;
        }

        logger.error('Login error:', error);
        res.status(401).json({
            success: false,
            error: {
                code: 'LOGIN_FAILED',
                message: error instanceof Error ? error.message : 'Login failed',
            },
        });
    }
}

/**
 * Verify email
 * GET /v1/auth/verify-email?token=xxx
 */
export async function verifyEmail(req: Request, res: Response): Promise<void> {
    try {
        // Validate query params
        const data = verifyEmailSchema.parse({ token: req.query.token });

        // Verify email
        const result = await authService.verifyEmail(data.token);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                error: formatZodError(error),
            });
            return;
        }

        logger.error('Email verification error:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'VERIFICATION_FAILED',
                message: error instanceof Error ? error.message : 'Email verification failed',
            },
        });
    }
}

/**
 * Resend verification email
 * POST /v1/auth/resend-verification
 */
export async function resendVerification(req: Request, res: Response): Promise<void> {
    try {
        // Validate request body
        const data = resendVerificationSchema.parse(req.body);

        // Resend verification
        const result = await authService.resendVerification(data.email);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                error: formatZodError(error),
            });
            return;
        }

        logger.error('Resend verification error:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'RESEND_FAILED',
                message: error instanceof Error ? error.message : 'Failed to resend verification email',
            },
        });
    }
}

/**
 * Request password reset
 * POST /v1/auth/forgot-password
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
    try {
        // Validate request body
        const data = forgotPasswordSchema.parse(req.body);

        // Request password reset
        const result = await authService.forgotPassword(data.email);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                error: formatZodError(error),
            });
            return;
        }

        logger.error('Forgot password error:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'FORGOT_PASSWORD_FAILED',
                message: error instanceof Error ? error.message : 'Failed to process password reset request',
            },
        });
    }
}

/**
 * Reset password
 * POST /v1/auth/reset-password
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
    try {
        // Validate request body
        const data = resetPasswordSchema.parse(req.body);

        // Reset password
        const result = await authService.resetPassword(data.token, data.newPassword);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                error: formatZodError(error),
            });
            return;
        }

        logger.error('Reset password error:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'RESET_PASSWORD_FAILED',
                message: error instanceof Error ? error.message : 'Password reset failed',
            },
        });
    }
}

/**
 * Change password (for logged-in users)
 * POST /v1/auth/change-password
 * Requires authentication
 */
export async function changePassword(req: Request, res: Response): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                },
            });
            return;
        }

        // Validate request body
        const data = changePasswordSchema.parse(req.body);

        // Change password
        const result = await authService.changePassword(
            req.userId,
            data.currentPassword,
            data.newPassword
        );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                error: formatZodError(error),
            });
            return;
        }

        logger.error('Change password error:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'CHANGE_PASSWORD_FAILED',
                message: error instanceof Error ? error.message : 'Password change failed',
            },
        });
    }
}

/**
 * Refresh access token
 * POST /v1/auth/refresh
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
    try {
        // Validate request body
        const data = refreshTokenSchema.parse(req.body);

        // Refresh tokens
        const result = await authService.refreshTokens(data.refreshToken);

        res.status(200).json({
            success: true,
            data: result,
            message: 'Tokens refreshed successfully',
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                error: formatZodError(error),
            });
            return;
        }

        logger.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            error: {
                code: 'REFRESH_FAILED',
                message: error instanceof Error ? error.message : 'Token refresh failed',
            },
        });
    }
}

/**
 * Logout user
 * POST /v1/auth/logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
    try {
        // Validate request body
        const data = logoutSchema.parse(req.body);

        // Logout
        const result = await authService.logout(data.refreshToken);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                error: formatZodError(error),
            });
            return;
        }

        logger.error('Logout error:', error);
        res.status(200).json({
            success: true,
            data: { message: 'Logged out successfully' },
        });
    }
}

/**
 * Get user profile
 * GET /v1/auth/profile
 * Requires authentication
 */
export async function getProfile(req: Request, res: Response): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                },
            });
            return;
        }

        // Get profile
        const user = await authService.getUserProfile(req.userId);

        res.status(200).json({
            success: true,
            data: { user },
        });
    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'GET_PROFILE_FAILED',
                message: error instanceof Error ? error.message : 'Failed to get profile',
            },
        });
    }
}
