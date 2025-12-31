import prisma from '../../config/database';
import { CreateProjectRequest, UpdateProjectRequest, SafeProject } from '../../types/userProject';
import logger from '../../config/logger';

/**
 * Project Service
 * Handles all project-related business logic
 */

/**
 * Create a new project for a user
 * 
 * @param userId - User ID
 * @param data - Project data
 * @returns Created project
 */
export async function createProject(
    userId: string,
    data: CreateProjectRequest
): Promise<SafeProject> {
    const { projectName, userIdea } = data;

    // Create project
    const project = await prisma.userProject.create({
        data: {
            userId,
            projectName,
            userIdea,
        },
    });

    logger.info(`Project created: ${project.id} for user: ${userId}`);

    return project;
}

/**
 * Get all projects for a specific user
 * 
 * @param userId - User ID
 * @returns List of user's projects
 */
export async function getUserProjects(userId: string): Promise<SafeProject[]> {
    const projects = await prisma.userProject.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });

    logger.info(`Retrieved ${projects.length} projects for user: ${userId}`);

    return projects;
}

/**
 * Get a specific project by ID
 * 
 * @param projectId - Project ID
 * @param userId - User ID (for authorization)
 * @returns Project
 */
export async function getProjectById(
    projectId: string,
    userId: string
): Promise<SafeProject> {
    const project = await prisma.userProject.findFirst({
        where: {
            id: projectId,
            userId, // Ensure user owns the project
        },
    });

    if (!project) {
        throw new Error('Project not found or access denied');
    }

    return project;
}

/**
 * Update a project
 * 
 * @param projectId - Project ID
 * @param userId - User ID (for authorization)
 * @param data - Update data
 * @returns Updated project
 */
export async function updateProject(
    projectId: string,
    userId: string,
    data: UpdateProjectRequest
): Promise<SafeProject> {
    // Check if project exists and user owns it
    const existingProject = await prisma.userProject.findFirst({
        where: {
            id: projectId,
            userId,
        },
    });

    if (!existingProject) {
        throw new Error('Project not found or access denied');
    }

    // Update project
    const project = await prisma.userProject.update({
        where: { id: projectId },
        data: {
            ...(data.projectName && { projectName: data.projectName }),
            ...(data.userIdea && { userIdea: data.userIdea }),
        },
    });

    logger.info(`Project updated: ${project.id}`);

    return project;
}

/**
 * Delete a project
 * 
 * @param projectId - Project ID
 * @param userId - User ID (for authorization)
 * @returns Success message
 */
export async function deleteProject(
    projectId: string,
    userId: string
): Promise<{ message: string }> {
    // Check if project exists and user owns it
    const existingProject = await prisma.userProject.findFirst({
        where: {
            id: projectId,
            userId,
        },
    });

    if (!existingProject) {
        throw new Error('Project not found or access denied');
    }

    // Delete project
    await prisma.userProject.delete({
        where: { id: projectId },
    });

    logger.info(`Project deleted: ${projectId}`);

    return { message: 'Project deleted successfully' };
}

/**
 * Get project count for a user
 * 
 * @param userId - User ID
 * @returns Project count
 */
export async function getUserProjectCount(userId: string): Promise<number> {
    const count = await prisma.userProject.count({
        where: { userId },
    });

    return count;
}
