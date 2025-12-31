import { User } from '@prisma/client';

// ============================================================================
// User Types
// ============================================================================

export type SafeUser = Omit<User, 'passwordHash'>;

export interface UserWithTokens extends SafeUser {
    accessToken: string;
    refreshToken: string;
}

// ============================================================================
// Request Types
// ============================================================================

export interface RegisterRequest {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface VerifyEmailRequest {
    token: string;
}

export interface ResendVerificationRequest {
    email: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface LogoutRequest {
    refreshToken: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface AuthResponse {
    user: SafeUser;
    tokens: {
        accessToken: string;
        refreshToken: string;
        accessTokenExpiresIn: string;
        refreshTokenExpiresIn: string;
    };
}

export interface MessageResponse {
    message: string;
}

export interface TokenResponse {
    tokens: {
        accessToken: string;
        refreshToken: string;
        accessTokenExpiresIn: string;
        refreshTokenExpiresIn: string;
    };
}

// ============================================================================
// JWT Payload Types
// ============================================================================

export interface AccessTokenPayload {
    userId: string;
    email: string;
    type: 'access';
}

export interface RefreshTokenPayload {
    userId: string;
    type: 'refresh';
    tokenId: string;
}

// ============================================================================
// Service Types
// ============================================================================

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    refreshTokenId: string;
}

export interface VerificationToken {
    token: string;
    expiresAt: Date;
}

// ============================================================================
// Express Request Extension
// ============================================================================

declare global {
    namespace Express {
        interface Request {
            user?: SafeUser;
            userId?: string;
        }
    }
}
