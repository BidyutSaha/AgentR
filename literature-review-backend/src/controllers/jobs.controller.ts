import { Request, Response } from 'express';
import prisma from '../config/database';
import { projectQueue, paperQueue, emailQueue, JOB_NAMES } from '../queues';
import logger from '../config/logger';

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

        // 4. Identify Queue and Retrieve BullMQ Job
        let queue;
        if ([JOB_NAMES.PROJECT_INIT_INTENT, JOB_NAMES.PROJECT_INIT_QUERY].includes(backgroundJob.jobType as any)) {
            queue = projectQueue;
        } else if (backgroundJob.jobType === 'PAPER_SCORING') { // Use string literal or enum match
            queue = paperQueue;
        } else if (backgroundJob.jobType === 'SEND_EMAIL') {
            queue = emailQueue;
        }

        if (!queue || !backgroundJob.bullJobId) {
            res.status(500).json({
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Could not determine queue or missing Bull Job ID' },
            });
            return;
        }

        const job = await queue.getJob(backgroundJob.bullJobId);

        if (!job) {
            // If BullMQ job is gone (TTL expired), we can't easily retry without payload.
            // Ideally we should have persisted payload.
            res.status(410).json({
                success: false,
                error: { code: 'JOB_EXPIRED', message: 'Underlying job data has expired. Please restart the process.' },
            });
            return;
        }

        // 5. Retry the Job
        await job.retry();

        // Update status back to PENDING or PROCESSING via logic? 
        // Worker will update it to PROCESSING when it picks it up.
        // We can manually set to PENDING to indicate we queued it.
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
