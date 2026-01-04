import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import prisma from '../config/database';
import logger from '../config/logger';
import { processIntent } from '../services/intent/intent.service';
import { processQueries } from '../services/queries/queries.service';
import { logLlmUsage } from '../services/llmUsageLogger.service';
import { projectQueue, emailQueue, JOB_NAMES } from '../queues'; // Update imports


import { JobStatus, JobType } from '@prisma/client';

// Helper to update BackgroundJob status
async function updateJobStatus(jobId: string, status: JobStatus, failureReason?: string, bullJobId?: string) {
    await prisma.backgroundJob.update({
        where: { id: jobId },
        data: {
            status,
            failureReason,
            bullJobId,
        },
    });
}

// Check Credits Helper
async function hasSufficientCredits(userId: string, estimatedCost: number = 0.5): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { aiCreditsBalance: true },
    });
    return (user?.aiCreditsBalance || 0) >= estimatedCost;
}

export const projectWorker = new Worker('project-init-queue', async (job: Job) => {
    const { backgroundJobId, projectId, userId, stageData } = job.data;

    logger.info({ action: 'project_worker_start', jobId: job.id, backgroundJobId });

    try {
        // 1. Update status to PROCESSING
        await updateJobStatus(backgroundJobId, 'PROCESSING', undefined, job.id);

        // 2. Identify Task Type
        if (job.name === JOB_NAMES.PROJECT_INIT_INTENT) {

            // Check Credits (Conservative estimate check before expensive call)
            if (!(await hasSufficientCredits(userId, 0.5))) { // e.g. 0.5 credits min
                throw new Error('INSUFFICIENT_CREDITS');
            }

            // Run Stage 1: Intent
            const output = await processIntent({ abstract: stageData.abstract });

            // 3. Save Output using Transaction (Update Project Fields)
            await prisma.userProject.update({
                where: { id: projectId },
                data: {
                    userIdea: output.output.abstract, // Sync abstract if changed
                    intentProcessedStatus: 'EVALUATED',
                    problemStatement: output.output.problem, // Save problem statement
                    methodologies: output.output.methodologies,
                    applicationDomains: output.output.applicationDomains,
                    constraints: output.output.constraints,
                    contributionTypes: output.output.contributionTypes,
                    keywordsSeed: output.output.keywords_seed
                }
            });

            // 4. Log Usage (Deducts Credits)
            if (output.usage) {
                await logLlmUsage({
                    userId,
                    projectId,
                    stage: 'intent',
                    modelName: output.usage.modelName,
                    provider: 'openai',
                    inputTokens: output.usage.inputTokens,
                    outputTokens: output.usage.outputTokens,
                    totalTokens: output.usage.totalTokens,
                    durationMs: output.usage.durationMs,
                    requestId: output.usage.requestId,
                    status: 'success'
                });
            }

            // 5. Trigger Next Job: Query Generation
            // Create BackgroundJob Record for Stage 2
            const nextJobRecord = await prisma.backgroundJob.create({
                data: {
                    userId,
                    projectId,
                    jobType: 'PROJECT_INIT_QUERY',
                    status: 'PENDING'
                }
            });

            // Add to Queue
            await projectQueue.add(JOB_NAMES.PROJECT_INIT_QUERY, {
                backgroundJobId: nextJobRecord.id,
                projectId,
                userId,
                stageData: {
                    // Pass formatted Stage 1 output to Stage 2
                    abstract: output.output.abstract,
                    problem: output.output.problem,
                    methodologies: output.output.methodologies,
                    applicationDomains: output.output.applicationDomains,
                    constraints: output.output.constraints,
                    contributionTypes: output.output.contributionTypes,
                    keywords_seed: output.output.keywords_seed
                }
            });

        } else if (job.name === JOB_NAMES.PROJECT_INIT_QUERY) {

            // Check Credits
            if (!(await hasSufficientCredits(userId, 0.5))) {
                throw new Error('INSUFFICIENT_CREDITS');
            }

            // Run Stage 2: Queries
            const result = await processQueries(stageData);

            // Save to DB
            await prisma.userProject.update({
                where: { id: projectId },
                data: {
                    searchQueryProcessedStatus: 'EVALUATED',
                    booleanQuery: result.output.booleanQuery,
                    expandedKeywords: result.output.expandedKeywords,
                    searchQueries: result.output.searchQueries as any, // Cast to Json
                }
            });

            // Log Usage (Deducts Credits)
            if (result.usage) {
                await logLlmUsage({
                    userId,
                    projectId,
                    stage: 'queries',
                    modelName: result.usage.modelName,
                    provider: 'openai',
                    inputTokens: result.usage.inputTokens,
                    outputTokens: result.usage.outputTokens,
                    totalTokens: result.usage.totalTokens,
                    durationMs: result.usage.durationMs,
                    requestId: result.usage.requestId,
                    status: 'success'
                });
            }

            // Trigger Email Notification (Next Step)
            const emailJob = await prisma.backgroundJob.create({
                data: {
                    userId,
                    projectId,
                    jobType: 'SEND_EMAIL',
                    status: 'PENDING'
                }
            });

            await emailQueue.add(JOB_NAMES.SEND_EMAIL, {
                backgroundJobId: emailJob.id,
                userId,
                projectId,
                type: 'PROJECT_INIT_COMPLETE'
            });
        }

        // Mark Job as Completed
        await updateJobStatus(backgroundJobId, 'COMPLETED', undefined, job.id);

    } catch (error: any) {
        logger.error({ action: 'project_worker_error', error: error.message });

        let status: JobStatus = 'FAILED';
        if (error.message === 'INSUFFICIENT_CREDITS') {
            status = 'FAILED_NO_CREDITS';
            // Also update Project Status
            await prisma.userProject.update({
                where: { id: projectId },
                data: {
                    intentProcessedStatus: job.name === JOB_NAMES.PROJECT_INIT_INTENT ? 'FAILED_INSUFFICIENT_CREDITS' : undefined,
                    searchQueryProcessedStatus: job.name === JOB_NAMES.PROJECT_INIT_QUERY ? 'FAILED_INSUFFICIENT_CREDITS' : undefined,
                }
            });
        }

        await updateJobStatus(backgroundJobId, status, error.message, job.id);
        throw error; // Let BullMQ handle retry if not permanent failure
    }

}, { connection: redisConnection });

projectWorker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed!`);
});

projectWorker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed with ${err.message}`);
});
