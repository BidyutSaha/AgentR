import { z } from 'zod';

/**
 * Validation Schemas
 * Uses Zod for runtime type checking and validation
 */

// ============================================================================
// Custom Validators
// ============================================================================

/**
 * Password validation schema
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Email validation schema
 */
const emailSchema = z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim();

/**
 * Token validation schema
 */
const tokenSchema = z
    .string()
    .min(1, 'Token is required')
    .trim();

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * Register request schema
 */
export const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    firstName: z.string().min(1, 'First name is required').max(50).trim().optional(),
    lastName: z.string().min(1, 'Last name is required').max(50).trim().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Login request schema
 */
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Verify email request schema
 */
export const verifyEmailSchema = z.object({
    token: tokenSchema,
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

/**
 * Resend verification request schema
 */
export const resendVerificationSchema = z.object({
    email: emailSchema,
});

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

/**
 * Forgot password request schema
 */
export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password request schema
 */
export const resetPasswordSchema = z.object({
    token: tokenSchema,
    newPassword: passwordSchema,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Change password request schema
 */
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Refresh token request schema
 */
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

/**
 * Logout request schema
 */
export const logoutSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type LogoutInput = z.infer<typeof logoutSchema>;

// ============================================================================
// Validation Helper
// ============================================================================

/**
 * Validate data against a schema
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Validated data
 * @throws ZodError if validation fails
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
}

/**
 * Safely validate data against a schema
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Object with success flag and data or error
 */
export function safeValidate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    return { success: false, error: result.error };
}

/**
 * Format Zod validation errors for API responses
 * @param error - Zod error
 * @returns Formatted error messages
 */
export function formatZodError(error: z.ZodError): {
    message: string;
    errors: Array<{ field: string; message: string }>;
} {
    const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
    }));

    return {
        message: 'Validation failed',
        errors,
    };
}
