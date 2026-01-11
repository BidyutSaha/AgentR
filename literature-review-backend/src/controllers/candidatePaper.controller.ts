import { Request, Response, NextFunction } from 'express';
import { parse } from 'csv-parse/sync';
import {
    createCandidatePaper,
    getCandidatePapers,
    getCandidatePaperById,
    getCandidatePaperByIdOnly,
    updateCandidatePaper,
    updateCandidatePaperByIdOnly,
    deleteCandidatePaper,
    deleteCandidatePaperByIdOnly,
} from '../services/candidatePaper/candidatePaper.service';
import logger from '../config/logger';

/**
 * Create a new candidate paper for a project
 * 
 * @route POST /v1/user-projects/:projectId/papers
 * @access Protected
 */
import { paperQueue, JOB_NAMES } from '../queues';
import prisma from '../config/database';
import { projectQueue } from '../queues'; // Ensure projectQueue import if needed, though only paperQueue is used here

// Helper for queue timeouts
const CONNECTION_TIMEOUT = 5000; // 5 seconds
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = CONNECTION_TIMEOUT): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('Queue operation timed out - Redis might be down')), timeoutMs)
        )
    ]);
};

/**
 * Create a new candidate paper for a project
 * 
 * @route POST /v1/user-projects/:projectId/papers
 * @access Protected
 */
export async function handleCreateCandidatePaper(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { projectId } = req.params;
        const userId = req.userId!; // From auth middleware
        const paperData = req.body;

        const paper = await createCandidatePaper(projectId, userId, paperData);

        // Fetch Project to get User Abstract (userIdea)
        const project = await prisma.userProject.findUnique({
            where: { id: projectId },
            select: { userIdea: true }
        });

        if (project && project.userIdea) {
            // Create Background Job Record
            const backgroundJob = await prisma.backgroundJob.create({
                data: {
                    userId,
                    projectId,
                    paperId: paper.id,
                    jobType: 'PAPER_SCORING',
                    status: 'PENDING',
                }
            });

            // Dispatch Async Job
            try {
                await withTimeout(paperQueue.add(JOB_NAMES.PAPER_SCORING, {
                    backgroundJobId: backgroundJob.id,
                    projectId,
                    paperId: paper.id,
                    userId,
                    stageData: {
                        userAbstract: project.userIdea,
                        candidateAbstract: paperData.paperAbstract,
                        title: paperData.paperTitle
                    }
                }));
            } catch (queueError: any) {
                logger.error('Failed to add paper job to queue:', queueError);
                await prisma.backgroundJob.update({
                    where: { id: backgroundJob.id },
                    data: {
                        status: 'FAILED',
                        failureReason: `Queue dispatch failed: ${queueError.message}`
                    }
                });
            }
        }

        res.status(202).json({
            success: true,
            data: {
                paper,
                message: 'Paper added and scoring started in background'
            },
        });
    } catch (error) {
        logger.error('Error creating candidate paper:', error);
        next(error);
    }
}

/**
 * Get all candidate papers for a project
 * 
 * @route GET /v1/user-projects/:projectId/papers
 * @access Protected
 */
export async function handleGetCandidatePapers(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { projectId } = req.params;
        const userId = req.userId!; // From auth middleware

        const papers = await getCandidatePapers(projectId, userId);

        res.status(200).json({
            success: true,
            data: {
                papers,
                count: papers.length,
            },
        });
    } catch (error) {
        logger.error('Error getting candidate papers:', error);
        next(error);
    }
}

/**
 * Get a single candidate paper by ID
 * 
 * @route GET /v1/user-projects/:projectId/papers/:paperId
 * @access Protected
 */
export async function handleGetCandidatePaperById(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { projectId, paperId } = req.params;
        const userId = req.userId!; // From auth middleware

        const paper = await getCandidatePaperById(projectId, paperId, userId);

        res.status(200).json({
            success: true,
            data: {
                paper,
            },
        });
    } catch (error) {
        logger.error('Error getting candidate paper:', error);
        next(error);
    }
}

/**
 * Get a single candidate paper by ID (without project ID)
 * 
 * @route GET /v1/papers/:paperId
 * @access Protected
 */
export async function handleGetCandidatePaperByIdOnly(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { paperId } = req.params;
        const userId = req.userId!; // From auth middleware

        const paper = await getCandidatePaperByIdOnly(paperId, userId);

        res.status(200).json({
            success: true,
            data: {
                paper,
            },
        });
    } catch (error) {
        logger.error('Error getting candidate paper:', error);
        next(error);
    }
}

/**
 * Update a single candidate paper by ID (without project ID)
 * 
 * @route PATCH /v1/papers/:paperId
 * @access Protected
 */
export async function handleUpdateCandidatePaperByIdOnly(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { paperId } = req.params;
        const userId = req.userId!; // From auth middleware
        const updateData = req.body;

        const paper = await updateCandidatePaperByIdOnly(paperId, userId, updateData);

        res.status(200).json({
            success: true,
            data: {
                paper,
            },
        });
    } catch (error) {
        logger.error('Error updating candidate paper:', error);
        next(error);
    }
}

/**
 * Update a candidate paper
 * 
 * @route PATCH /v1/user-projects/:projectId/papers/:paperId
 * @access Protected
 */
export async function handleUpdateCandidatePaper(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { projectId, paperId } = req.params;
        const userId = req.userId!; // From auth middleware
        const updateData = req.body;

        const paper = await updateCandidatePaper(projectId, paperId, userId, updateData);

        res.status(200).json({
            success: true,
            data: {
                paper,
            },
        });
    } catch (error) {
        logger.error('Error updating candidate paper:', error);
        next(error);
    }
}

/**
 * Delete a candidate paper
 * 
 * @route DELETE /v1/user-projects/:projectId/papers/:paperId
 * @access Protected
 */
export async function handleDeleteCandidatePaper(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { projectId, paperId } = req.params;
        const userId = req.userId!; // From auth middleware

        const result = await deleteCandidatePaper(projectId, paperId, userId);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        logger.error('Error deleting candidate paper:', error);
        next(error);
    }
}

/**
 * Delete a single candidate paper by ID (without project ID)
 * 
 * @route DELETE /v1/papers/:paperId
 * @access Protected
 */
export async function handleDeleteCandidatePaperByIdOnly(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { paperId } = req.params;
        const userId = req.userId!; // From auth middleware

        const result = await deleteCandidatePaperByIdOnly(paperId, userId);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        logger.error('Error deleting candidate paper:', error);
        next(error);
    }
}

/**
 * Bulk upload candidate papers via CSV
 *
 * @route POST /v1/user-projects/:projectId/papers/bulk-upload
 * @access Protected
 */
export async function handleBulkUploadCandidatePapers(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { projectId } = req.params;
        const userId = req.userId!;

        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }

        // Fetch Project for User Abstract (userIdea)
        const project = await prisma.userProject.findUnique({
            where: { id: projectId },
            select: { userIdea: true }
        });

        if (!project) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
        }

        const fileContent = req.file.buffer.toString('utf-8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        let processedCount = 0;
        let failedCount = 0;
        const errors: any[] = [];

        // We will process sequentially to avoid overwhelming DB
        for (const [index, record] of records.entries()) {
            const rowNumber = index + 1;
            const row = record as any;

            // Validate Row (Flexible standard headers)
            const title = row.title || row.Title || row.paperTitle;
            const abstract = row.abstract || row.Abstract || row.paperAbstract || '';
            const downloadLink = row.url || row.URL || row.link || row.Link || row.paperDownloadLink || null;

            if (!title) {
                failedCount++;
                errors.push({ row: rowNumber, reason: 'Missing title' });
                continue;
            }

            try {
                // Create Paper
                const paper = await createCandidatePaper(projectId, userId, {
                    paperTitle: title,
                    paperAbstract: abstract,
                    paperDownloadLink: downloadLink
                });

                // Dispatch Job if Project Abstract Available
                if (project.userIdea) {
                    const backgroundJob = await prisma.backgroundJob.create({
                        data: {
                            userId,
                            projectId,
                            paperId: paper.id,
                            jobType: 'PAPER_SCORING',
                            status: 'PENDING',
                        }
                    });

                    try {
                        await withTimeout(paperQueue.add(JOB_NAMES.PAPER_SCORING, {
                            backgroundJobId: backgroundJob.id,
                            projectId,
                            paperId: paper.id,
                            userId,
                            stageData: {
                                userAbstract: project.userIdea,
                                candidateAbstract: abstract,
                                title: title
                            }
                        }));
                    } catch (queueError: any) {
                        logger.error('Failed to add bulk paper job to queue:', queueError);
                        await prisma.backgroundJob.update({
                            where: { id: backgroundJob.id },
                            data: {
                                status: 'FAILED',
                                failureReason: `Queue dispatch failed: ${queueError.message}`
                            }
                        });
                    }
                }

                processedCount++;

            } catch (err: any) {
                failedCount++;
                errors.push({ row: rowNumber, reason: err.message });
            }
        }

        res.status(202).json({
            success: true,
            data: {
                processedCount,
                failedCount,
                message: `Queued ${processedCount} papers for scoring. ${failedCount} failed.`,
                errors: errors.length > 0 ? errors : undefined
            }
        });

    } catch (error) {
        logger.error('Error in bulk upload:', error);
        next(error);
    }
}

/**
 * Download CSV Template for Bulk Upload
 *
 * @route GET /v1/user-projects/papers/bulk-upload-template
 * @access Protected
 */
export async function handleGetBulkUploadTemplate(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const csvContent = 'title,abstract,url';

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="papers_template.csv"');
        res.status(200).send(csvContent);

    } catch (error) {
        logger.error('Error generating template:', error);
        next(error);
    }
}
