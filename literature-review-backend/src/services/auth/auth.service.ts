import prisma from '../../config/database';
import { generateToken } from '../../utils/crypto';
import { hashPassword, verifyPassword, validatePasswordStrength } from './password.service';
import {
    generateTokenPair,
    verifyRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens,
} from './token.service';
import {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
} from './email.service';
import {
    SafeUser,
    AuthResponse,
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
} from '../../types/auth';
import { config } from '../../config/env';
import logger from '../../config/logger';

/**
 * Authentication Service
 * Main service that orchestrates all authentication operations
 */

/**
 * Remove password hash from user object
 */
function toSafeUser(user: any): SafeUser {
    const { passwordHash, ...safeUser } = user;
    return safeUser as SafeUser;
}

/**
 * Register a new user
 * 
 * @param data - Registration data
 * @returns User and message
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
    const { email, password, firstName, lastName } = data;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with verification token
    const verificationToken = generateToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await prisma.user.create({
        data: {
            email: email.toLowerCase(),
            passwordHash,
            firstName,
            lastName,
            isVerified: false,
            emailVerificationTokens: {
                create: {
                    token: verificationToken,
                    expiresAt: verificationExpiry,
                },
            },
        },
    });

    // Send verification email
    await sendVerificationEmail(
        user.email,
        user.firstName || 'there',
        verificationToken
    );

    logger.info(`User registered: ${user.email}`);

    return {
        user: toSafeUser(user),
        message: 'Registration successful. Please check your email to verify your account.',
    };
}

/**
 * Login user
 * 
 * @param data - Login credentials
 * @returns User and tokens
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (!user) {
        throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
        throw new Error('Account has been deactivated');
    }

    // Check if email is verified
    if (!user.isVerified) {
        throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
    });

    // Generate tokens
    const tokens = await generateTokenPair(user.id, user.email);

    logger.info(`User logged in: ${user.email}`);

    return {
        user: toSafeUser(user),
        tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            accessTokenExpiresIn: config.jwt.accessExpiration,
            refreshTokenExpiresIn: config.jwt.refreshExpiration,
        },
    };
}

/**
 * Verify email with token
 * 
 * @param token - Verification token
 * @returns Success message
 */
export async function verifyEmail(token: string): Promise<{ message: string }> {
    // Find verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
        where: { token },
        include: { user: true },
    });

    if (!verificationToken) {
        throw new Error('Invalid verification token');
    }

    if (verificationToken.usedAt) {
        throw new Error('Verification token has already been used');
    }

    if (verificationToken.expiresAt < new Date()) {
        throw new Error('Verification token has expired');
    }

    // Mark user as verified
    await prisma.user.update({
        where: { id: verificationToken.userId },
        data: { isVerified: true },
    });

    // Mark token as used
    await prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
    });

    // Send welcome email
    await sendWelcomeEmail(
        verificationToken.user.email,
        verificationToken.user.firstName || 'there'
    );

    logger.info(`Email verified: ${verificationToken.user.email}`);

    return { message: 'Email verified successfully' };
}

/**
 * Resend verification email
 * 
 * @param email - User email
 * @returns Success message
 */
export async function resendVerification(email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (!user) {
        // Don't reveal if user exists
        return { message: 'If the email exists, a verification link has been sent' };
    }

    if (user.isVerified) {
        throw new Error('Email is already verified');
    }

    // Invalidate old tokens
    await prisma.emailVerificationToken.updateMany({
        where: {
            userId: user.id,
            usedAt: null,
        },
        data: { usedAt: new Date() },
    });

    // Create new verification token
    const verificationToken = generateToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.emailVerificationToken.create({
        data: {
            userId: user.id,
            token: verificationToken,
            expiresAt: verificationExpiry,
        },
    });

    // Send verification email
    await sendVerificationEmail(
        user.email,
        user.firstName || 'there',
        verificationToken
    );

    logger.info(`Verification email resent: ${user.email}`);

    return { message: 'Verification email sent' };
}

/**
 * Request password reset
 * 
 * @param email - User email
 * @returns Success message
 */
export async function forgotPassword(email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (!user) {
        // Don't reveal if user exists
        return { message: 'If the email exists, a password reset link has been sent' };
    }

    // Invalidate old tokens
    await prisma.passwordResetToken.updateMany({
        where: {
            userId: user.id,
            usedAt: null,
        },
        data: { usedAt: new Date() },
    });

    // Create password reset token
    const resetToken = generateToken();
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
        data: {
            userId: user.id,
            token: resetToken,
            expiresAt: resetExpiry,
        },
    });

    // Send password reset email
    await sendPasswordResetEmail(
        user.email,
        user.firstName || 'there',
        resetToken
    );

    logger.info(`Password reset requested: ${user.email}`);

    return { message: 'Password reset email sent' };
}

/**
 * Reset password with token
 * 
 * @param token - Reset token
 * @param newPassword - New password
 * @returns Success message
 */
export async function resetPassword(
    token: string,
    newPassword: string
): Promise<{ message: string }> {
    // Validate new password
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
    }

    // Find reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
    });

    if (!resetToken) {
        throw new Error('Invalid reset token');
    }

    if (resetToken.usedAt) {
        throw new Error('Reset token has already been used');
    }

    if (resetToken.expiresAt < new Date()) {
        throw new Error('Reset token has expired');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
    });

    // Revoke all refresh tokens for security
    await revokeAllUserTokens(resetToken.userId);

    logger.info(`Password reset: ${resetToken.user.email}`);

    return { message: 'Password reset successfully' };
}

/**
 * Change password (for logged-in users)
 * 
 * @param userId - User ID
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @returns Success message
 */
export async function changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
): Promise<{ message: string }> {
    // Validate new password
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
    }

    // Get user
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
    });

    // Revoke all refresh tokens for security
    await revokeAllUserTokens(userId);

    logger.info(`Password changed: ${user.email}`);

    return { message: 'Password changed successfully. Please log in again.' };
}

/**
 * Refresh access token
 * 
 * @param refreshToken - Refresh token
 * @returns New token pair
 */
export async function refreshTokens(refreshToken: string): Promise<{
    tokens: {
        accessToken: string;
        refreshToken: string;
        accessTokenExpiresIn: string;
        refreshTokenExpiresIn: string;
    };
}> {
    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);

    // Get user
    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
    });

    if (!user) {
        throw new Error('User not found');
    }

    if (!user.isActive) {
        throw new Error('Account has been deactivated');
    }

    // Revoke old refresh token
    await revokeRefreshToken(payload.tokenId);

    // Generate new token pair
    const tokens = await generateTokenPair(user.id, user.email);

    // Update the revoked token with the new token ID (for audit trail)
    await prisma.refreshToken.update({
        where: { id: payload.tokenId },
        data: { replacedByToken: tokens.refreshTokenId },
    });

    logger.info(`Tokens refreshed: ${user.email}`);

    return {
        tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            accessTokenExpiresIn: config.jwt.accessExpiration,
            refreshTokenExpiresIn: config.jwt.refreshExpiration,
        },
    };
}

/**
 * Logout user
 * 
 * @param refreshToken - Refresh token to revoke
 * @returns Success message
 */
export async function logout(refreshToken: string): Promise<{ message: string }> {
    try {
        const payload = await verifyRefreshToken(refreshToken);
        await revokeRefreshToken(payload.tokenId);
        logger.info(`User logged out: ${payload.userId}`);
    } catch (error) {
        // Token might already be invalid, but that's okay for logout
        logger.warn('Logout with invalid token:', error);
    }

    return { message: 'Logged out successfully' };
}

/**
 * Get user profile
 * 
 * @param userId - User ID
 * @returns User profile
 */
export async function getUserProfile(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error('User not found');
    }

    return toSafeUser(user);
}
