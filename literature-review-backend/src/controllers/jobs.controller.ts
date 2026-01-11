import { Request, Response } from 'express';
import prisma from '../config/database';
import { projectQueue, paperQueue, emailQueue } from '../queues';
import logger from '../config/logger';
import { JobType } from '@prisma/client';
import { Queue } from 'bullmq';

/**
 * Helper to determine the queue for a given JobType
 */
function getQueueForJobType(jobType: JobType): Queue | null {
    switch (jobType) {
        case 'PROJECT_INIT_INTENT':
        case 'PROJECT_INIT_QUERY':
            return projectQueue;
        case 'PAPER_SCORING':
            return paperQueue;
        case 'SEND_EMAIL':
            return emailQueue;
        default:
            return null;
    }
}

/**
 * Helper: Reconstruct job payload if missing from Redis
 */
async function reconstructJobPayload(jobType: JobType, projectId: string | null, paperId: string | null, userId: string): Promise<any> {
    if (jobType === 'PROJECT_INIT_INTENT' || jobType === 'PROJECT_INIT_QUERY') {
        if (!projectId) return null; // Cannot reconstruct without Project ID
        return { projectId, userId };
    }
    if (jobType === 'PAPER_SCORING') {
        if (!paperId || !projectId) return null; // Need both for paper scoring
        return { paperId, projectId, userId };
    }
    // SEND_EMAIL is harder to reconstruct without storing specific email data in DB. 
    // For now, we only support resuming core logic jobs if Redis data is lost.
    return null;
}

/**
 * Resume a failed background job
 * POST /v1/jobs/:jobId/resume
 */
export async function resumeJob(req: Request, res: Response): Promise<void> {
    try {
        const { jobId } = req.params;
        const userId = req.userId!;

        // 1. Find the Job
        const backgroundJob = await prisma.backgroundJob.findUnique({
            where: { id: jobId },
        });

        if (!backgroundJob) {
            res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Job not found' },
            });
            return;
        }

        // 2. Check Ownership
        if (backgroundJob.userId !== userId) {
            res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Not authorized to resume this job' },
            });
            return;
        }

        // 3. Check Status
        if (backgroundJob.status !== 'FAILED' && backgroundJob.status !== 'FAILED_NO_CREDITS') {
            res.status(400).json({
                success: false,
                error: { code: 'INVALID_STATE', message: 'Job is not in a failed state' },
            });
            return;
        }

        // 4. ORPHAN CHECK: Ensure Project Still Exists
        if (backgroundJob.projectId) {
            const projectExists = await prisma.userProject.findUnique({
                where: { id: backgroundJob.projectId },
                select: { id: true }
            });

            if (!projectExists) {
                // Determine if we should mark as cancelled or just fail
                // For now, mark as FAILED with specific reason so user knows why
                await prisma.backgroundJob.update({
                    where: { id: jobId },
                    data: {
                        status: 'FAILED',
                        failureReason: 'Project no longer exists (job orphaned)'
                    }
                });
                res.status(404).json({
                    success: false,
                    error: { code: 'PROJECT_CRITICAL_ERROR', message: 'Parent project no longer exists. Job cannot be resumed.' }
                });
                return;
            }
        }

        // 5. CREDIT CHECK: Ensure User Has Credits
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { aiCreditsBalance: true }
        });

        if (!user || user.aiCreditsBalance <= 0) {
            await prisma.backgroundJob.update({
                where: { id: jobId },
                data: { status: 'FAILED_NO_CREDITS', failureReason: 'Insufficient credits to resume' }
            });
            res.status(402).json({
                success: false,
                error: { code: 'INSUFFICIENT_CREDITS', message: 'Please recharge credits to resume this job' }
            });
            return;
        }

        // 6. Identify Queue
        const queue = getQueueForJobType(backgroundJob.jobType);
        if (!queue) {
            res.status(500).json({
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Could not determine queue for job type' },
            });
            return;
        }

        // 7. Resume Strategy: Try Redis first, then Reconstruct
        let redisJob = backgroundJob.bullJobId ? await queue.getJob(backgroundJob.bullJobId) : null;

        if (redisJob) {
            // Case A: Job exists in Redis (Failed state)
            await redisJob.retry();
        } else {
            // Case B: Job missing from Redis (Expired or Redis Incident)
            // Reconstruct payload and create NEW BullMQ job
            const payload = await reconstructJobPayload(backgroundJob.jobType, backgroundJob.projectId, backgroundJob.paperId, userId);

            if (!payload) {
                res.status(410).json({
                    success: false,
                    error: { code: 'JOB_DATA_LOST', message: 'Job data expired and could not be reconstructed.' }
                });
                return;
            }

            // Create new job in queue
            const newJob = await queue.add(backgroundJob.jobType, payload);

            // Update DB with new Bull Job ID
            await prisma.backgroundJob.update({
                where: { id: jobId },
                data: { bullJobId: newJob.id }
            });
        }

        // 8. Update Status to PENDING
        await prisma.backgroundJob.update({
            where: { id: jobId },
            data: { status: 'PENDING', failureReason: null }
        });

        res.status(200).json({
            success: true,
            data: { message: 'Job resumed successfully' },
        });

    } catch (error: any) {
        logger.error('Resume job error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'RESUME_FAILED',
                message: error.message || 'Failed to resume job',
            },
        });
    }
}

/**
 * Resume ALL failed background jobs for the user
 * POST /v1/jobs/resume-all
 */
export async function resumeAllFailedJobs(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.userId!;

        // 1. Check User Credits First (Optimization)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { aiCreditsBalance: true }
        });

        if (!user || user.aiCreditsBalance <= 0) {
            res.status(402).json({
                success: false,
                error: { code: 'INSUFFICIENT_CREDITS', message: 'Cannot resume jobs. Global balance is 0 or negative.' }
            });
            return;
        }

        // 2. Find all failed jobs for this user
        const failedJobs = await prisma.backgroundJob.findMany({
            where: {
                userId,
                status: { in: ['FAILED', 'FAILED_NO_CREDITS'] }
            }
        });

        if (failedJobs.length === 0) {
            res.status(200).json({
                success: true,
                data: { message: 'No failed jobs found to resume', count: 0 },
            });
            return;
        }

        let resumeCount = 0;
        const errors: string[] = [];

        // 3. Iterate and Resume
        for (const backgroundJob of failedJobs) {
            try {
                // A. Orphan Check
                if (backgroundJob.projectId) {
                    const projectExists = await prisma.userProject.findUnique({
                        where: { id: backgroundJob.projectId },
                        select: { id: true }
                    });
                    if (!projectExists) {
                        // Mark as perm failed
                        await prisma.backgroundJob.update({
                            where: { id: backgroundJob.id },
                            data: { status: 'FAILED', failureReason: 'Project deleted (Orphaned)' }
                        });
                        continue;
                    }
                }

                const queue = getQueueForJobType(backgroundJob.jobType);
                if (!queue) continue; // Skip invalid types

                // B. Resume Logic (Redis vs Reconstruct)
                let redisJob = backgroundJob.bullJobId ? await queue.getJob(backgroundJob.bullJobId) : null;

                if (redisJob) {
                    await redisJob.retry();
                } else {
                    // Try reconstruct
                    const payload = await reconstructJobPayload(backgroundJob.jobType, backgroundJob.projectId, backgroundJob.paperId, userId);
                    if (payload) {
                        const newJob = await queue.add(backgroundJob.jobType, payload);
                        await prisma.backgroundJob.update({
                            where: { id: backgroundJob.id },
                            data: { bullJobId: newJob.id }
                        });
                    } else {
                        // Cannot reconstruct, skip
                        continue;
                    }
                }

                await prisma.backgroundJob.update({
                    where: { id: backgroundJob.id },
                    data: { status: 'PENDING', failureReason: null }
                });

                resumeCount++;
            } catch (err: any) {
                logger.error(`Failed to resume job ${backgroundJob.id} in batch:`, err);
                errors.push(err.message);
            }
        }

        res.status(200).json({
            success: true,
            data: {
                message: `Successfully resumed ${resumeCount} jobs`,
                count: resumeCount,
                totalFailedFound: failedJobs.length
            },
        });

    } catch (error: any) {
        logger.error('Batch resume jobs error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'BATCH_RESUME_FAILED',
                message: error.message || 'Failed to resume jobs',
            },
        });
    }
}

/**
 * Get background jobs for the authenticated user
 * GET /v1/jobs
 * Query Params:
 * - status: Optional comma-separated list of statuses (e.g. "PENDING,FAILED")
 * - limit: Optional number of records (default 20)
 * - offset: Optional offset (default 0)
 */
export async function getJobs(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.userId!;
        const { status, limit, offset } = req.query;

        // Parse pagination
        const take = limit ? parseInt(limit as string) : 20;
        const skip = offset ? parseInt(offset as string) : 0;

        // Build filter
        const where: any = {
            userId,
        };

        if (status) {
            const statuses = (status as string).split(',').map(s => s.trim().toUpperCase());
            // Filter by valid statuses if needed, but for now we trust the input will match DB enum or return empty
            if (statuses.length > 0) {
                where.status = { in: statuses };
            }
        }

        const [jobs, total] = await Promise.all([
            prisma.backgroundJob.findMany({
                where,
                take,
                skip,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.backgroundJob.count({ where })
        ]);

        res.status(200).json({
            success: true,
            data: {
                jobs,
                pagination: {
                    total,
                    limit: take,
                    offset: skip,
                    hasMore: skip + jobs.length < total
                }
            },
        });

    } catch (error: any) {
        logger.error('Get jobs error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'GET_JOBS_FAILED',
                message: error.message || 'Failed to retrieve jobs',
            },
        });
    }
}
