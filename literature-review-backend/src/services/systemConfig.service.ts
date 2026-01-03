import prisma from '../config/database';
import logger from '../config/logger';

/**
 * System Configuration Service
 * Manages global system settings with history tracking
 */

// ============================================================================
// CREDITS MULTIPLIER MANAGEMENT
// ============================================================================

/**
 * Get current active USD to Credits multiplier
 */
export async function getCurrentMultiplier() {
    const current = await prisma.creditsMultiplierHistory.findFirst({
        where: { isActive: true },
        orderBy: { effectiveFrom: 'desc' },
    });

    return current?.usdToCreditsMultiplier || 100.0; // Default: 1 USD = 100 Credits
}

/**
 * Get multiplier history
 */
export async function getMultiplierHistory() {
    const history = await prisma.creditsMultiplierHistory.findMany({
        orderBy: { effectiveFrom: 'desc' },
    });

    return history;
}

/**
 * Update USD to Credits multiplier (creates new history entry)
 */
export async function updateMultiplier(
    multiplier: number,
    adminId: string,
    description?: string
) {
    if (multiplier <= 0) {
        throw new Error('Multiplier must be greater than 0');
    }

    // 1. Mark current entry as inactive and set end date
    await prisma.creditsMultiplierHistory.updateMany({
        where: { isActive: true },
        data: {
            isActive: false,
            effectiveTo: new Date(),
        },
    });

    // 2. Create new entry
    const newEntry = await prisma.creditsMultiplierHistory.create({
        data: {
            usdToCreditsMultiplier: multiplier,
            description: description || `1 USD = ${multiplier} AI Credits`,
            updatedBy: adminId,
            effectiveFrom: new Date(),
            isActive: true,
        },
    });

    logger.info(`Credits multiplier updated to ${multiplier} by admin ${adminId}`);

    return newEntry;
}

// ============================================================================
// DEFAULT CREDITS MANAGEMENT
// ============================================================================

/**
 * Get current active default credits for new users
 */
export async function getCurrentDefaultCredits() {
    const current = await prisma.defaultCreditsHistory.findFirst({
        where: { isActive: true },
        orderBy: { effectiveFrom: 'desc' },
    });

    return current?.defaultCredits || 1000.0; // Default: 1000 credits
}

/**
 * Get default credits history
 */
export async function getDefaultCreditsHistory() {
    const history = await prisma.defaultCreditsHistory.findMany({
        orderBy: { effectiveFrom: 'desc' },
    });

    return history;
}

/**
 * Update default credits for new users (creates new history entry)
 */
export async function updateDefaultCredits(
    credits: number,
    adminId: string,
    description?: string
) {
    if (credits <= 0) {
        throw new Error('Default credits must be greater than 0');
    }

    // 1. Mark current entry as inactive and set end date
    await prisma.defaultCreditsHistory.updateMany({
        where: { isActive: true },
        data: {
            isActive: false,
            effectiveTo: new Date(),
        },
    });

    // 2. Create new entry
    const newEntry = await prisma.defaultCreditsHistory.create({
        data: {
            defaultCredits: credits,
            description: description || `New users receive ${credits} AI Credits`,
            updatedBy: adminId,
            effectiveFrom: new Date(),
            isActive: true,
        },
    });

    logger.info(`Default credits updated to ${credits} by admin ${adminId}`);

    return newEntry;
}

// ============================================================================
// COMBINED SYSTEM CONFIG
// ============================================================================

/**
 * Get current system configuration (both multiplier and default credits)
 */
export async function getSystemConfig() {
    const [multiplier, defaultCredits] = await Promise.all([
        getCurrentMultiplier(),
        getCurrentDefaultCredits(),
    ]);

    return {
        usdToCreditsMultiplier: multiplier,
        defaultCreditsForNewUsers: defaultCredits,
    };
}
