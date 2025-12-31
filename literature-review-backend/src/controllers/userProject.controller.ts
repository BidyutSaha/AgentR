import { Request, Response } from 'express';
import * as userProjectService from '../services/projects/userProject.service';
import {
    createProjectSchema,
    updateProjectSchema,
    projectIdSchema,
    formatZodError,
} from '../services/projects/userProject.schema';
import { ZodError } from 'zod';
import logger from '../config/logger';

/**
 * Project Controller
 * Handles HTTP requests for project endpoints
 */

/**
 * Create a new project
 * POST /v1/projects
 */
export async function createProject(req: Request, res: Response): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                },
            });
            return;
        }

        // Validate request body
        const data = createProjectSchema.parse(req.body);

        // Create project
        const project = await userProjectService.createProject(req.userId, data);

        res.status(201).json({
            success: true,
            data: { project },
            message: 'Project created successfully',
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                error: formatZodError(error),
            });
            return;
        }

        logger.error('Create project error:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'CREATE_PROJECT_FAILED',
                message: error instanceof Error ? error.message : 'Failed to create project',
            },
        });
    }
}

/**
 * Get all projects for the authenticated user
 * GET /v1/projects
 */
export async function getUserProjects(req: Request, res: Response): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                },
            });
            return;
        }

        // Get user's projects
        const projects = await userProjectService.getUserProjects(req.userId);
        const total = projects.length;

        res.status(200).json({
            success: true,
            data: {
                projects,
                total,
            },
        });
    } catch (error) {
        logger.error('Get projects error:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'GET_PROJECTS_FAILED',
                message: error instanceof Error ? error.message : 'Failed to get projects',
            },
        });
    }
}

/**
 * Get all projects for a specific user by userId
 * GET /v1/projects/user/:userId
 */
export async function getProjectsByUserId(req: Request, res: Response): Promise<void> {
    try {
        // Validate user ID from URL parameter
        const userId = req.params.userId;

        if (!userId) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_USER_ID',
                    message: 'User ID is required',
                },
            });
            return;
        }

        // Get projects for the specified user
        const projects = await userProjectService.getUserProjects(userId);
        const total = projects.length;

        res.status(200).json({
            success: true,
            data: {
                userId,
                projects,
                total,
            },
        });
    } catch (error) {
        logger.error('Get projects by userId error:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'GET_PROJECTS_FAILED',
                message: error instanceof Error ? error.message : 'Failed to get projects',
            },
        });
    }
}


/**
 * Get a specific project by ID
 * GET /v1/projects/:projectId
 */
export async function getProjectById(req: Request, res: Response): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                },
            });
            return;
        }

        // Validate project ID
        const { projectId } = projectIdSchema.parse({ projectId: req.params.projectId });

        // Get project
        const project = await userProjectService.getProjectById(projectId, req.userId);

        res.status(200).json({
            success: true,
            data: { project },
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                error: formatZodError(error),
            });
            return;
        }

        logger.error('Get project error:', error);
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
        res.status(statusCode).json({
            success: false,
            error: {
                code: 'GET_PROJECT_FAILED',
                message: error instanceof Error ? error.message : 'Failed to get project',
            },
        });
    }
}

/**
 * Update a project
 * PUT /v1/projects/:projectId
 */
export async function updateProject(req: Request, res: Response): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                },
            });
            return;
        }

        // Validate project ID
        const { projectId } = projectIdSchema.parse({ projectId: req.params.projectId });

        // Validate request body
        const data = updateProjectSchema.parse(req.body);

        // Update project
        const project = await userProjectService.updateProject(projectId, req.userId, data);

        res.status(200).json({
            success: true,
            data: { project },
            message: 'Project updated successfully',
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                error: formatZodError(error),
            });
            return;
        }

        logger.error('Update project error:', error);
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
        res.status(statusCode).json({
            success: false,
            error: {
                code: 'UPDATE_PROJECT_FAILED',
                message: error instanceof Error ? error.message : 'Failed to update project',
            },
        });
    }
}

/**
 * Delete a project
 * DELETE /v1/projects/:projectId
 */
export async function deleteProject(req: Request, res: Response): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                },
            });
            return;
        }

        // Validate project ID
        const { projectId } = projectIdSchema.parse({ projectId: req.params.projectId });

        // Delete project
        const result = await userProjectService.deleteProject(projectId, req.userId);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                error: formatZodError(error),
            });
            return;
        }

        logger.error('Delete project error:', error);
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
        res.status(statusCode).json({
            success: false,
            error: {
                code: 'DELETE_PROJECT_FAILED',
                message: error instanceof Error ? error.message : 'Failed to delete project',
            },
        });
    }
}
