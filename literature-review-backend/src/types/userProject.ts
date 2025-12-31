import { UserProject } from '@prisma/client';

/**
 * Project Types
 */

// Safe project (for API responses)
export type SafeProject = Omit<UserProject, never>;

// Create project request
export interface CreateProjectRequest {
    projectName: string;
    userIdea: string;
}

// Update project request
export interface UpdateProjectRequest {
    projectName?: string;
    userIdea?: string;
}

// Project response
export interface ProjectResponse {
    project: SafeProject;
}

// Projects list response
export interface ProjectsListResponse {
    projects: SafeProject[];
    total: number;
}
