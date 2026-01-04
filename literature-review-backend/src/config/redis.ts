import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

const redisConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
};

export const redisConnection = new Redis(redisConfig);

redisConnection.on('error', (err) => {
    logger.error('Redis connection error', err);
});

redisConnection.on('connect', () => {
    logger.info('Connected to Redis');
});
