import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import prisma from '../config/database';
import logger from '../config/logger';
import { JobStatus } from '@prisma/client';

import { transporter, emailTemplates } from '../config/email';
import { config } from '../config/env';

// Helper to update BackgroundJob status
async function updateJobStatus(jobId: string, status: JobStatus, failureReason?: string, bullJobId?: string) {
    if (!jobId) return;
    await prisma.backgroundJob.update({
        where: { id: jobId },
        data: {
            status,
            failureReason,
            bullJobId,
        },
    });
}

export const emailWorker = new Worker('email-queue', async (job: Job) => {
    const { backgroundJobId, userId, projectId, type } = job.data;

    logger.info({ action: 'email_worker_start', jobId: job.id, type });

    try {
        await updateJobStatus(backgroundJobId, 'PROCESSING', undefined, job.id);

        // Fetch Data
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const project = await prisma.userProject.findUnique({ where: { id: projectId } });

        if (!user || !project) {
            throw new Error('User or Project not found');
        }

        let emailContent;
        if (type === 'PROJECT_SCORING_COMPLETE') {
            const paperCount = await prisma.candidatePaper.count({ where: { projectId } });
            emailContent = emailTemplates.projectScoringComplete(user.firstName || 'User', project.projectName, paperCount);
        }
        else if (type === 'PROJECT_INIT_COMPLETE') {
            emailContent = emailTemplates.projectInitComplete(user.firstName || 'User', project.projectName);
        }

        if (emailContent) {
            await transporter.sendMail({
                from: config.emailFrom,
                to: user.email,
                subject: emailContent.subject,
                text: emailContent.text,
                html: emailContent.html,
            });
            logger.info({ action: 'email_sent', to: user.email, type });
        } else {
            logger.warn({ action: 'email_skipped', reason: 'Unknown Email Type', type });
        }

        await updateJobStatus(backgroundJobId, 'COMPLETED', undefined, job.id);

    } catch (error: any) {
        logger.error({ action: 'email_worker_error', error: error.message });
        await updateJobStatus(backgroundJobId, 'FAILED', error.message, job.id);
        throw error;
    }

}, { connection: redisConnection });

emailWorker.on('completed', (job) => {
    logger.info(`Email Job ${job.id} completed`);
});
