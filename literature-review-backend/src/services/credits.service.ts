import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Credits Management Service
 * Handles admin operations for managing user AI Credits
 */

/**
 * Recharge AI Credits for a user (Admin only)
 */
export async function rechargeUserCredits(
    userId: string,
    amount: number,
    adminId: string,
    reason?: string
) {
    if (amount <= 0) {
        throw new Error('Recharge amount must be greater than 0');
    }

    // Check if user exists and get current balance
    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, aiCreditsBalance: true },
    });

    if (!existingUser) {
        throw new Error('User not found');
    }

    const balanceBefore = existingUser.aiCreditsBalance;
    const balanceAfter = balanceBefore + amount;

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
        // 1. Update user balance
        const user = await tx.user.update({
            where: { id: userId },
            data: {
                aiCreditsBalance: {
                    increment: amount,
                },
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                aiCreditsBalance: true,
            },
        });

        // 2. Create transaction record
        await tx.userCreditsTransaction.create({
            data: {
                userId,
                adminId,
                transactionType: 'ADMIN_RECHARGE',
                amount,
                balanceBefore,
                balanceAfter,
                reason,
                description: `Admin recharge: +${amount} credits`,
            },
        });

        return user;
    });

    logger.info(`Admin ${adminId} recharged ${amount} credits for user ${result.email}. New balance: ${result.aiCreditsBalance}. Reason: ${reason || 'N/A'}`);

    return result;
}

/**
 * Get user's AI Credits balance (Admin only)
 */
export async function getUserCreditsBalance(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            aiCreditsBalance: true,
            createdAt: true,
        },
    });

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}

/**
 * Deduct AI Credits from a user (Admin only)
 */
export async function deductUserCredits(
    userId: string,
    amount: number,
    adminId: string,
    reason?: string
) {
    if (amount <= 0) {
        throw new Error('Deduct amount must be greater than 0');
    }

    // Check if user exists and get current balance
    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, aiCreditsBalance: true },
    });

    if (!existingUser) {
        throw new Error('User not found');
    }

    const balanceBefore = existingUser.aiCreditsBalance;
    const balanceAfter = balanceBefore - amount;

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
        // 1. Update user balance
        const user = await tx.user.update({
            where: { id: userId },
            data: {
                aiCreditsBalance: {
                    decrement: amount,
                },
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                aiCreditsBalance: true,
            },
        });

        // 2. Create transaction record
        await tx.userCreditsTransaction.create({
            data: {
                userId,
                adminId,
                transactionType: 'ADMIN_DEDUCT',
                amount: -amount, // Negative for deduction
                balanceBefore,
                balanceAfter,
                reason,
                description: `Admin deduction: -${amount} credits`,
            },
        });

        return user;
    });

    logger.info(`Admin ${adminId} deducted ${amount} credits from user ${result.email}. New balance: ${result.aiCreditsBalance}. Reason: ${reason || 'N/A'}`);

    return result;
}

/**
 * Get user's transaction history
 */
export async function getUserTransactionHistory(
    userId: string,
    limit: number = 50,
    startDate?: Date,
    endDate?: Date
) {
    const where: any = { userId };

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
    }

    const transactions = await prisma.userCreditsTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
            id: true,
            transactionType: true,
            amount: true,
            balanceBefore: true,
            balanceAfter: true,
            reason: true,
            description: true,
            adminId: true,
            createdAt: true,
        },
    });

    return transactions;
}

/**
 * Get current user's own credits balance
 */
export async function getMyCreditsBalance(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            aiCreditsBalance: true,
        },
    });

    if (!user) {
        throw new Error('User not found');
    }

    return {
        balance: user.aiCreditsBalance,
    };
}

/**
 * Get all transactions (Admin only)
 */
export async function getAllTransactions(
    limit: number = 50,
    startDate?: Date,
    endDate?: Date
) {
    const where: any = {};

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
    }

    const transactions = await prisma.userCreditsTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });

    return transactions;
}
