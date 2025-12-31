import crypto from 'crypto';

/**
 * Generate a secure random token
 * @param length - Length of the token in bytes (default: 32)
 * @returns Hex string token
 */
export function generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a secure random string
 * @param length - Length of the string (default: 32)
 * @returns Base64 URL-safe string
 */
export function generateSecureString(length: number = 32): string {
    return crypto
        .randomBytes(Math.ceil((length * 3) / 4))
        .toString('base64')
        .slice(0, length)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Hash a string using SHA-256
 * @param data - Data to hash
 * @returns Hex string hash
 */
export function hashString(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Compare two strings in constant time to prevent timing attacks
 * @param a - First string
 * @param b - Second string
 * @returns True if strings are equal
 */
export function constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }

    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
