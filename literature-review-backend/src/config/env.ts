import dotenv from 'dotenv';

dotenv.config();

export const config = {
    // Server
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    databaseUrl: process.env.DATABASE_URL || '',

    // JWT
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET || '',
        refreshSecret: process.env.JWT_REFRESH_SECRET || '',
        accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
        refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    },

    // Email/SMTP
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER || '',
        password: process.env.SMTP_PASSWORD || '',
    },
    emailFrom: process.env.EMAIL_FROM || 'noreply@literaturereview.com',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

    // Security
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

    // LLM Provider
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    llmModel: process.env.LLM_MODEL || 'gpt-4-turbo-preview',
    embeddingsModel: process.env.EMBEDDINGS_MODEL || 'text-embedding-3-small',

    // External APIs
    semanticScholarApiKey: process.env.SEMANTIC_SCHOLAR_API_KEY || '',

    // Application Settings
    defaultTimeWindowYears: parseInt(process.env.DEFAULT_TIME_WINDOW_YEARS || '5', 10),
    logLevel: process.env.LOG_LEVEL || 'info',
} as const;

// Backward compatibility
export const env = config;

// Validation
export function validateEnv(): void {
    const errors: string[] = [];

    // Database
    if (!config.databaseUrl) {
        errors.push('DATABASE_URL is required');
    }

    // JWT
    if (!config.jwt.accessSecret) {
        errors.push('JWT_ACCESS_SECRET is required');
    }
    if (!config.jwt.refreshSecret) {
        errors.push('JWT_REFRESH_SECRET is required');
    }
    if (config.jwt.accessSecret === config.jwt.refreshSecret) {
        errors.push('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
    }
    if (config.jwt.accessSecret.length < 32) {
        errors.push('JWT_ACCESS_SECRET must be at least 32 characters');
    }
    if (config.jwt.refreshSecret.length < 32) {
        errors.push('JWT_REFRESH_SECRET must be at least 32 characters');
    }

    // Email (only in production)
    if (config.nodeEnv === 'production') {
        if (!config.smtp.user) {
            errors.push('SMTP_USER is required in production');
        }
        if (!config.smtp.password) {
            errors.push('SMTP_PASSWORD is required in production');
        }
    }

    // OpenAI
    if (!config.openaiApiKey && config.nodeEnv === 'production') {
        errors.push('OPENAI_API_KEY is required in production');
    }

    if (errors.length > 0) {
        throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
    }
}
