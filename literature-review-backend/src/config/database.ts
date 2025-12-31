import { PrismaClient } from '@prisma/client';
import logger from './logger';

// Singleton pattern for Prisma Client
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    // In development, use a global variable to prevent multiple instances
    // during hot reloading
    if (!(global as any).prisma) {
        (global as any).prisma = new PrismaClient({
            log: ['error', 'warn'],
        });
    }
    prisma = (global as any).prisma;
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
    logger.info('Prisma client disconnected');
});

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
    try {
        await prisma.$connect();
        logger.info('✓ Database connection successful');
        return true;
    } catch (error) {
        logger.error('✗ Database connection failed:', error);
        return false;
    }
}

export default prisma;
