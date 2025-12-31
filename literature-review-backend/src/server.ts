import { createApp } from './app';
import { env, validateEnv } from './config/env';
import logger from './config/logger';

async function startServer(): Promise<void> {
    try {
        // Validate environment variables
        logger.info('Validating environment variables...');
        validateEnv();
        logger.info('✓ Environment variables validated');

        // Test database connection (optional - don't fail if it doesn't work)
        try {
            const { testDatabaseConnection } = await import('./config/database');
            await testDatabaseConnection();
        } catch (error) {
            logger.warn('Database connection test failed (continuing anyway):', error);
        }

        // Test email connection (optional - don't fail if it doesn't work)
        try {
            const { verifyEmailConnection } = await import('./config/email');
            await verifyEmailConnection();
        } catch (error) {
            logger.warn('Email connection test failed (continuing anyway):', error);
        }

        // Create Express app
        logger.info('Creating Express app...');
        const app = createApp();
        logger.info('✓ Express app created');

        // Start server
        const server = app.listen(env.port, () => {
            logger.info(`🚀 Server running on http://localhost:${env.port}`);
            logger.info(`🔥 Environment: ${env.nodeEnv}`);
            logger.info(`🏥 Health check: http://localhost:${env.port}/v1/health`);
        });

        // Handle server errors
        server.on('error', (error: any) => {
            if (error.code === 'EADDRINUSE') {
                logger.error(`Port ${env.port} is already in use`);
            } else {
                logger.error('Server error:', error);
            }
            process.exit(1);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        if (error instanceof Error) {
            logger.error('Error message:', error.message);
            logger.error('Error stack:', error.stack);
        }
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    logger.error('Stack:', error.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the server
startServer();
