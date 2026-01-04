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
import { projectQueue, JOB_NAMES } from '../queues'; // Add imports
import prisma from '../config/database'; // Add prisma import

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

        // Create project (Synchronous DB creation)
        const project = await userProjectService.createProject(req.userId, data);

        // Create Background Job Record
        const backgroundJob = await prisma.backgroundJob.create({
            data: {
                userId: req.userId,
                projectId: project.id,
                jobType: 'PROJECT_INIT_INTENT',
                status: 'PENDING',
            }
        });

        // Dispatch Async Job to Queue
        await projectQueue.add(JOB_NAMES.PROJECT_INIT_INTENT, {
            backgroundJobId: backgroundJob.id,
            projectId: project.id,
            userId: req.userId,
            stageData: {
                abstract: data.userIdea
            }
        });

        // Return 202 Accepted (Non-blocking)
        res.status(202).json({
            success: true,
            data: {
                project,
                jobId: backgroundJob.id,
                status: 'processing_started'
            },
            message: 'Project created and processing started in background',
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

/**
 * Export Project Report (Excel)
 * GET /v1/user-projects/:projectId/export
 */
import ExcelJS from 'exceljs';

export async function exportProject(req: Request, res: Response): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const { projectId } = projectIdSchema.parse({ projectId: req.params.projectId });

        // Fetch Project with Papers
        const projectData = await prisma.userProject.findUnique({
            where: { id: projectId },
            include: {
                candidatePapers: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!projectData || projectData.userId !== req.userId) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
        }

        // Explicitly type to access fields (Prisma inferred types can be tricky with includes)
        const project = projectData as any; // Quick fix to access array fields without complex generated types

        // Create Workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Paper Agent';
        workbook.created = new Date();

        // --- SHEET 1: PROJECT OVERVIEW ---
        const sheet1 = workbook.addWorksheet('Project Overview');
        sheet1.columns = [
            { header: 'Field', key: 'field', width: 25 },
            { header: 'Value', key: 'value', width: 100 }
        ];

        // Helper to strip Markdown (simple regex for basic MD)
        const stripMd = (text: string | null) => text ? text.replace(/[*#`_]/g, '') : '';

        // Safely parse JSON queries
        let searchQueries = '';
        try {
            if (project.searchQueries) {
                const queries = JSON.parse(JSON.stringify(project.searchQueries));
                searchQueries = Array.isArray(queries) ? queries.join('\n') : String(queries);
            }
        } catch (e) { searchQueries = 'Error parsing queries'; }

        sheet1.addRows([
            { field: 'Project ID', value: project.id }, // Added Project ID
            { field: 'Project Name', value: project.projectName },
            { field: 'User Idea', value: stripMd(project.userIdea) },
            { field: 'Problem Statement', value: stripMd(project.problemStatement || '') },
            { field: 'Methodologies', value: project.methodologies.join(', ') },
            { field: 'Domains', value: project.applicationDomains.join(', ') },
            { field: 'Constraints', value: project.constraints.join(', ') },
            { field: 'Contribution Types', value: project.contributionTypes.join(', ') },
            { field: 'Seed Keywords', value: project.keywordsSeed.join(', ') },
            { field: 'Extended Keywords', value: project.expandedKeywords.join(', ') }, // Added
            { field: 'Boolean Query', value: project.booleanQuery },
            { field: 'Generated Queries', value: searchQueries },
            { field: 'Created At', value: project.createdAt.toISOString() },
            { field: 'Last Updated', value: project.updatedAt.toISOString() } // Added
        ]);

        // Style Header
        sheet1.getRow(1).font = { bold: true };

        // Wrap text for Value column
        sheet1.getColumn(2).alignment = { wrapText: true };

        // --- SHEET 2: SCORED PAPERS ---
        const sheet2 = workbook.addWorksheet('Scored Papers');
        sheet2.columns = [
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Abstract', key: 'abstract', width: 50 },
            { header: 'Processed?', key: 'processed', width: 12 },
            { header: 'Model', key: 'model', width: 15 }, // Added
            { header: 'Similarity', key: 'sim', width: 12 },
            { header: 'Problem Overlap', key: 'prob_ov', width: 15 }, // Split
            { header: 'Method Overlap', key: 'meth_ov', width: 15 }, // Split
            { header: 'Domain Overlap', key: 'dom_ov', width: 15 }, // Split
            { header: 'Constraint Overlap', key: 'const_ov', width: 15 }, // Split
            { header: 'C1 Score', key: 'c1', width: 10 },
            { header: 'C1 Justification', key: 'c1_just', width: 40 }, // Added
            { header: 'C1 Strengths', key: 'c1_str', width: 30 }, // Added
            { header: 'C1 Weaknesses', key: 'c1_weak', width: 30 }, // Added
            { header: 'C2 Score', key: 'c2', width: 10 },
            { header: 'C2 Justification', key: 'c2_just', width: 40 }, // Added
            { header: 'C2 Contribution', key: 'c2_type', width: 25 }, // Added
            { header: 'C2 Relevance', key: 'c2_rel', width: 30 }, // Added
            { header: 'C2 Strengths', key: 'c2_str', width: 30 }, // Added
            { header: 'C2 Weaknesses', key: 'c2_weak', width: 30 }, // Added
            { header: 'Research Gaps', key: 'gaps', width: 40 },
            { header: 'Novelty', key: 'novelty', width: 40 },
            { header: 'Candidate Advantage', key: 'advantage', width: 40 }, // Added
            { header: 'Last Updated', key: 'updated', width: 20 }, // Added
            { header: 'Link', key: 'link', width: 25 }
        ];

        project.candidatePapers.forEach((p: any) => {
            sheet2.addRow({
                title: p.paperTitle,
                abstract: stripMd(p.paperAbstract).substring(0, 1000) + '...',
                processed: p.isProcessedByLlm ? 'Yes' : 'No',
                model: p.similarityModelName || 'N/A',
                sim: p.semanticSimilarity?.toString() || 'N/A',
                prob_ov: p.problemOverlap || 'N/A',
                meth_ov: p.methodOverlap || 'N/A', // Corrected mapping from DB
                dom_ov: p.domainOverlap || 'N/A',
                const_ov: p.constraintOverlap || 'N/A',
                c1: p.c1Score?.toString() || 'N/A',
                c1_just: stripMd(p.c1Justification),
                c1_str: stripMd(p.c1Strengths),
                c1_weak: stripMd(p.c1Weaknesses),
                c2: p.c2Score?.toString() || 'N/A',
                c2_just: stripMd(p.c2Justification),
                c2_type: stripMd(p.c2ContributionType),
                c2_rel: stripMd(p.c2RelevanceAreas),
                c2_str: stripMd(p.c2Strengths),
                c2_weak: stripMd(p.c2Weaknesses),
                gaps: stripMd(p.researchGaps),
                novelty: stripMd(p.userNovelty),
                advantage: stripMd(p.candidateAdvantage),
                updated: p.updatedAt ? new Date(p.updatedAt).toISOString() : '',
                link: p.paperDownloadLink
            });
        });

        // Set Wrap Text for all data rows in Sheet 2
        sheet2.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                row.alignment = { vertical: 'top', wrapText: true };
            }
        });

        // Style Header
        sheet2.getRow(1).font = { bold: true };

        // Send Response
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Project_Report_${project.id.substring(0, 8)}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        logger.error('Export project error:', error);
        res.status(500).json({ success: false, message: 'Export failed' });
    }
}
