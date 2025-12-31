import bcrypt from 'bcrypt';
import { config } from '../../config/env';

/**
 * Password Service
 * Handles password hashing, verification, and validation
 */

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(config.bcryptRounds);
    return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hash - Hashed password from database
 * @returns True if password matches
 */
export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * 
 * @param password - Password to validate
 * @returns Object with isValid and errors array
 */
export function validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Check if password needs rehashing
 * (e.g., if bcrypt rounds have been increased)
 * 
 * @param hash - Current password hash
 * @returns True if password should be rehashed
 */
export function needsRehash(hash: string): boolean {
    try {
        const rounds = bcrypt.getRounds(hash);
        return rounds < config.bcryptRounds;
    } catch {
        return true;
    }
}
