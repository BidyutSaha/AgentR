import { Request, Response, NextFunction } from 'express';
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

        res.status(201).json({
            success: true,
            data: {
                paper,
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
