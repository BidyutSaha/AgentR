import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import prisma from '../config/database';
import logger from '../config/logger';
import { processCategorize } from '../services/categorize/categorize.service';
import { logLlmUsage } from '../services/llmUsageLogger.service';
import { paperQueue, emailQueue, JOB_NAMES } from '../queues';
import { JobStatus } from '@prisma/client';

// Helper to update BackgroundJob status
async function updateJobStatus(jobId: string, status: JobStatus, failureReason?: string, bullJobId?: string) {
    if (!jobId) return; // Should not happen if correctly passed
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

export const paperWorker = new Worker('paper-scoring-queue', async (job: Job) => {
    const { backgroundJobId, projectId, paperId, userId, stageData } = job.data;
    const { userAbstract, candidateAbstract, title } = stageData;

    logger.info({ action: 'paper_worker_start', jobId: job.id, paperId, backgroundJobId });

    try {
        // 1. Update status to PROCESSING
        await updateJobStatus(backgroundJobId, 'PROCESSING', undefined, job.id);

        // 2. Check Credits
        if (!(await hasSufficientCredits(userId, 0.5))) {
            throw new Error('INSUFFICIENT_CREDITS');
        }

        // 3. Process Paper Scoring
        const output = await processCategorize({
            userAbstract,
            candidateAbstract,
            projectId,
            paperId
        });

        const result = output.output;

        // 4. Update Database
        await prisma.candidatePaper.update({
            where: { id: paperId },
            data: {
                isProcessedByLlm: true,
                semanticSimilarity: result.semantic_similarity, // Decimal handled by Prisma
                problemOverlap: result.problem_overlap,
                methodOverlap: result.method_overlap, // Added
                domainOverlap: result.domain_overlap,
                constraintOverlap: result.constraint_overlap,

                c1Score: result.c1_score,
                c1Justification: result.c1_justification,
                c1Strengths: JSON.stringify(result.c1_strengths),
                c1Weaknesses: JSON.stringify(result.c1_weaknesses),

                c2Score: result.c2_score,
                c2Justification: result.c2_justification,
                c2ContributionType: result.c2_contribution_type,
                c2RelevanceAreas: JSON.stringify(result.c2_relevance_areas),
                c2Strengths: JSON.stringify(result.c2_strengths),
                c2Weaknesses: JSON.stringify(result.c2_weaknesses),

                researchGaps: JSON.stringify(result.research_gaps),
                userNovelty: result.user_novelty,
                candidateAdvantage: result.candidate_advantage, // Added

                modelUsed: output.usage?.modelName,
                inputTokensUsed: output.usage?.inputTokens,
                outputTokensUsed: output.usage?.outputTokens,
                processedAt: new Date(),
            }
        });

        // 5. Log Usage & Deduct Credits
        if (output.usage) {
            await logLlmUsage({
                userId,
                projectId,
                paperId,
                stage: 'score',
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

        // 6. Check Completion for Project to trigger Email
        const remainingPapers = await prisma.candidatePaper.count({
            where: {
                projectId,
                isProcessedByLlm: false
            }
        });

        if (remainingPapers === 0) {
            logger.info({ action: 'project_scoring_complete', projectId });

            // Create a Background Job for Email
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
                type: 'PROJECT_SCORING_COMPLETE'
            });
        }

        // Mark Job as Completed
        await updateJobStatus(backgroundJobId, 'COMPLETED', undefined, job.id);

    } catch (error: any) {
        logger.error({ action: 'paper_worker_error', error: error.message });

        // Handle Credits Failure specifically
        let status: JobStatus = 'FAILED';
        if (error.message === 'INSUFFICIENT_CREDITS') {
            status = 'FAILED_NO_CREDITS';
        }

        await updateJobStatus(backgroundJobId, status, error.message, job.id);
        throw error;
    }
}, { connection: redisConnection });

paperWorker.on('completed', (job) => {
    logger.info(`Paper Job ${job.id} completed!`);
});

paperWorker.on('failed', (job, err) => {
    logger.error(`Paper Job ${job?.id} failed with ${err.message}`);
});
