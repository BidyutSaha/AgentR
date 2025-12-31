import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import prisma from '../../config/database';
import { generateToken } from '../../utils/crypto';
import {
    AccessTokenPayload,
    RefreshTokenPayload,
    TokenPair,
} from '../../types/auth';

/**
 * Token Service
 * Handles JWT token generation, verification, and management
 */

/**
 * Generate an access token (short-lived)
 * Used for API authentication
 * 
 * @param userId - User ID
 * @param email - User email
 * @returns JWT access token
 */
export function generateAccessToken(userId: string, email: string): string {
    const payload: AccessTokenPayload = {
        userId,
        email,
        type: 'access',
    };

    return jwt.sign(payload, config.jwt.accessSecret, {
        expiresIn: config.jwt.accessExpiration,
    });
}

/**
 * Generate a refresh token (long-lived)
 * Used to obtain new access tokens
 * 
 * @param userId - User ID
 * @returns Object with refresh token and token ID
 */
export async function generateRefreshToken(
    userId: string
): Promise<{ token: string; tokenId: string }> {
    // Create refresh token record in database
    const refreshTokenRecord = await prisma.refreshToken.create({
        data: {
            userId,
            token: generateToken(64), // Placeholder, will be replaced
            expiresAt: new Date(
                Date.now() + parseDuration(config.jwt.refreshExpiration)
            ),
        },
    });

    // Generate JWT with token ID
    const payload: RefreshTokenPayload = {
        userId,
        type: 'refresh',
        tokenId: refreshTokenRecord.id,
    };

    const token = jwt.sign(payload, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiration,
    });

    // Update database with actual JWT token
    await prisma.refreshToken.update({
        where: { id: refreshTokenRecord.id },
        data: { token },
    });

    return {
        token,
        tokenId: refreshTokenRecord.id,
    };
}

/**
 * Generate both access and refresh tokens
 * 
 * @param userId - User ID
 * @param email - User email
 * @returns Token pair with access and refresh tokens
 */
export async function generateTokenPair(
    userId: string,
    email: string
): Promise<TokenPair> {
    const accessToken = generateAccessToken(userId, email);
    const { token: refreshToken, tokenId } = await generateRefreshToken(userId);

    return {
        accessToken,
        refreshToken,
        refreshTokenId: tokenId,
    };
}

/**
 * Verify and decode an access token
 * 
 * @param token - JWT access token
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
    try {
        const payload = jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;

        if (payload.type !== 'access') {
            throw new Error('Invalid token type');
        }

        return payload;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Access token expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid access token');
        }
        throw error;
    }
}

/**
 * Verify and decode a refresh token
 * Also checks if token exists in database and is not revoked
 * 
 * @param token - JWT refresh token
 * @returns Decoded token payload
 * @throws Error if token is invalid, expired, or revoked
 */
export async function verifyRefreshToken(
    token: string
): Promise<RefreshTokenPayload> {
    try {
        // Verify JWT signature and expiration
        const payload = jwt.verify(token, config.jwt.refreshSecret) as RefreshTokenPayload;

        if (payload.type !== 'refresh') {
            throw new Error('Invalid token type');
        }

        // Check if token exists in database and is not revoked
        const tokenRecord = await prisma.refreshToken.findUnique({
            where: { id: payload.tokenId },
        });

        if (!tokenRecord) {
            throw new Error('Refresh token not found');
        }

        if (tokenRecord.revokedAt) {
            throw new Error('Refresh token has been revoked');
        }

        if (tokenRecord.expiresAt < new Date()) {
            throw new Error('Refresh token expired');
        }

        return payload;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Refresh token expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid refresh token');
        }
        throw error;
    }
}

/**
 * Revoke a refresh token
 * Used during logout or when rotating tokens
 * 
 * @param tokenId - Refresh token ID
 * @param replacedBy - Optional: ID of new token (for rotation)
 */
export async function revokeRefreshToken(
    tokenId: string,
    replacedBy?: string
): Promise<void> {
    await prisma.refreshToken.update({
        where: { id: tokenId },
        data: {
            revokedAt: new Date(),
            replacedByToken: replacedBy,
        },
    });
}

/**
 * Revoke all refresh tokens for a user
 * Used when changing password or for security purposes
 * 
 * @param userId - User ID
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
        where: {
            userId,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });
}

/**
 * Clean up expired tokens
 * Should be run periodically (e.g., daily cron job)
 */
export async function cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
        where: {
            expiresAt: {
                lt: new Date(),
            },
        },
    });

    return result.count;
}

/**
 * Parse duration string to milliseconds
 * Supports: '15m', '7d', '1h', etc.
 * 
 * @param duration - Duration string
 * @returns Milliseconds
 */
function parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
        throw new Error(`Invalid duration format: ${duration}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
}
