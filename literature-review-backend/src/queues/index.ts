import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

// Define Queues
export const projectQueue = new Queue('project-init-queue', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true, // Keep cleaner Redis
        removeOnFail: false, // Keep specifically for debugging
    },
});

export const paperQueue = new Queue('paper-scoring-queue', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

export const emailQueue = new Queue('email-queue', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 5000, // Email services might be rate limited
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

// Job Names (for type safety string matching)
export const JOB_NAMES = {
    PROJECT_INIT_INTENT: 'project-init-intent',
    PROJECT_INIT_QUERY: 'project-init-query',
    PAPER_SCORING: 'paper-scoring',
    SEND_EMAIL: 'send-email',
} as const;
