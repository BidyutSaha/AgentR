import prisma from '../../config/database';
import logger from '../../config/logger';
import {
    CreateCandidatePaperInput,
    UpdateCandidatePaperInput
} from './candidatePaper.schema';
import { SafeCandidatePaper } from '../../types/candidatePaper';

/**
 * Convert Prisma CandidatePaper to safe format
 * Converts Decimal types to numbers for JSON serialization
 * 
 * @param paper - Prisma candidate paper object
 * @returns Safe candidate paper object
 */
function toSafeCandidatePaper(paper: any): SafeCandidatePaper {
    return {
        ...paper,
        semanticSimilarity: paper.semanticSimilarity ? Number(paper.semanticSimilarity) : null,
        c1Score: paper.c1Score ? Number(paper.c1Score) : null,
        c2Score: paper.c2Score ? Number(paper.c2Score) : null,
    };
}

/**
 * Create a new candidate paper for a project
 * 
 * Creates a paper with basic information (title, abstract, link).
 * LLM processing fields are initially null and will be populated
 * when the paper is processed via the /process endpoint.
 * 
 * @param projectId - ID of the project
 * @param userId - ID of the user (for authorization check)
 * @param data - Paper data (title, abstract, optional download link)
 * @returns Created candidate paper
 * @throws {Error} If project not found or user doesn't own project
 * 
 * @example
 * ```typescript
 * const paper = await createCandidatePaper(
 *     'project-123',
 *     'user-456',
 *     {
 *         paperTitle: 'Deep Learning for NLP',
 *         paperAbstract: 'This paper presents...',
 *         paperDownloadLink: 'https://arxiv.org/pdf/1234.5678'
 *     }
 * );
 * ```
 */
export async function createCandidatePaper(
    projectId: string,
    userId: string,
    data: CreateCandidatePaperInput
): Promise<SafeCandidatePaper> {
    // Verify project exists and user owns it
    const project = await prisma.userProject.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        throw new Error('Project not found');
    }

    if (project.userId !== userId) {
        throw new Error('You do not have permission to add papers to this project');
    }

    // Create candidate paper with basic info only
    const paper = await prisma.candidatePaper.create({
        data: {
            projectId,
            paperTitle: data.paperTitle,
            paperAbstract: data.paperAbstract,
            paperDownloadLink: data.paperDownloadLink || null,
            isProcessedByLlm: false, // Will be set to true after LLM processing
        },
    });

    logger.info(`Candidate paper created: ${paper.id} for project: ${projectId}`);

    return toSafeCandidatePaper(paper);
}

/**
 * Get all candidate papers for a project
 * 
 * @param projectId - ID of the project
 * @param userId - ID of the user (for authorization check)
 * @returns List of candidate papers
 * @throws {Error} If project not found or user doesn't own project
 */
export async function getCandidatePapers(
    projectId: string,
    userId: string
): Promise<SafeCandidatePaper[]> {
    // Verify project exists and user owns it
    const project = await prisma.userProject.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        throw new Error('Project not found');
    }

    if (project.userId !== userId) {
        throw new Error('You do not have permission to view papers for this project');
    }

    // Get all papers for the project
    const papers = await prisma.candidatePaper.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
    });

    return papers.map(toSafeCandidatePaper);
}

/**
 * Get a single candidate paper by ID
 * 
 * @param projectId - ID of the project
 * @param paperId - ID of the paper
 * @param userId - ID of the user (for authorization check)
 * @returns Candidate paper
 * @throws {Error} If paper not found or user doesn't own project
 */
export async function getCandidatePaperById(
    projectId: string,
    paperId: string,
    userId: string
): Promise<SafeCandidatePaper> {
    // Verify project exists and user owns it
    const project = await prisma.userProject.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        throw new Error('Project not found');
    }

    if (project.userId !== userId) {
        throw new Error('You do not have permission to view papers for this project');
    }

    // Get the paper
    const paper = await prisma.candidatePaper.findFirst({
        where: {
            id: paperId,
            projectId,
        },
    });

    if (!paper) {
        throw new Error('Paper not found');
    }

    return toSafeCandidatePaper(paper);
}

/**
 * Get a single candidate paper by ID (without project ID)
 * 
 * @param paperId - ID of the paper
 * @param userId - ID of the user (for authorization check)
 * @returns Candidate paper
 * @throws {Error} If paper not found or user doesn't own project
 */
export async function getCandidatePaperByIdOnly(
    paperId: string,
    userId: string
): Promise<SafeCandidatePaper> {
    // Get paper with project info
    const paper = await prisma.candidatePaper.findUnique({
        where: { id: paperId },
        include: {
            project: true, // We need project to check ownership
        },
    });

    if (!paper) {
        throw new Error('Paper not found');
    }

    // Verify ownership
    if (paper.project.userId !== userId) {
        throw new Error('You do not have permission to view this paper');
    }

    // Remove project info before returning
    const { project, ...paperData } = paper;
    return toSafeCandidatePaper(paperData);
}

/**
 * Update a candidate paper
 * 
 * Allows updating basic paper information (title, abstract, link).
 * LLM analysis fields cannot be updated manually - they are set via /process endpoint.
 * 
 * @param projectId - ID of the project
 * @param paperId - ID of the paper to update
 * @param userId - ID of the user (for authorization check)
 * @param data - Updated paper data
 * @returns Updated candidate paper
 * @throws {Error} If paper not found or user doesn't own project
 * 
 * @example
 * ```typescript
 * const updated = await updateCandidatePaper(
 *     'project-123',
 *     'paper-456',
 *     'user-789',
 *     {
 *         paperTitle: 'Updated Title',
 *         paperAbstract: 'Updated abstract...'
 *     }
 * );
 * ```
 */
export async function updateCandidatePaper(
    projectId: string,
    paperId: string,
    userId: string,
    data: UpdateCandidatePaperInput
): Promise<SafeCandidatePaper> {
    // Verify project exists and user owns it
    const project = await prisma.userProject.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        throw new Error('Project not found');
    }

    if (project.userId !== userId) {
        throw new Error('You do not have permission to update papers in this project');
    }

    // Verify paper exists and belongs to this project
    const existingPaper = await prisma.candidatePaper.findFirst({
        where: {
            id: paperId,
            projectId,
        },
    });

    if (!existingPaper) {
        throw new Error('Paper not found');
    }

    // Helper to process array or string fields
    const processArrayField = (field: string | string[] | undefined): string | undefined => {
        if (Array.isArray(field)) {
            return JSON.stringify(field);
        }
        return field;
    };

    // Update the paper
    const updatedPaper = await prisma.candidatePaper.update({
        where: { id: paperId },
        data: {
            // Basic Info
            ...(data.paperTitle && { paperTitle: data.paperTitle }),
            ...(data.paperAbstract && { paperAbstract: data.paperAbstract }),
            ...(data.paperDownloadLink !== undefined && {
                paperDownloadLink: data.paperDownloadLink || null
            }),

            // LLM Fields
            ...(data.isProcessedByLlm !== undefined && { isProcessedByLlm: data.isProcessedByLlm }),
            ...(data.semanticSimilarity !== undefined && { semanticSimilarity: data.semanticSimilarity }),
            ...(data.similarityModelName && { similarityModelName: data.similarityModelName }),

            ...(data.problemOverlap && { problemOverlap: data.problemOverlap }),
            ...(data.domainOverlap && { domainOverlap: data.domainOverlap }),
            ...(data.constraintOverlap && { constraintOverlap: data.constraintOverlap }),

            ...(data.c1Score !== undefined && { c1Score: data.c1Score }),
            ...(data.c1Justification && { c1Justification: data.c1Justification }),
            ...(data.c1Strengths !== undefined && { c1Strengths: processArrayField(data.c1Strengths) }),
            ...(data.c1Weaknesses !== undefined && { c1Weaknesses: processArrayField(data.c1Weaknesses) }),

            ...(data.c2Score !== undefined && { c2Score: data.c2Score }),
            ...(data.c2Justification && { c2Justification: data.c2Justification }),
            ...(data.c2ContributionType && { c2ContributionType: data.c2ContributionType }),
            ...(data.c2RelevanceAreas !== undefined && { c2RelevanceAreas: processArrayField(data.c2RelevanceAreas) }),

            ...(data.researchGaps !== undefined && { researchGaps: processArrayField(data.researchGaps) }),
            ...(data.userNovelty && { userNovelty: data.userNovelty }),

            ...(data.modelUsed && { modelUsed: data.modelUsed }),
            ...(data.inputTokensUsed !== undefined && { inputTokensUsed: data.inputTokensUsed }),
            ...(data.outputTokensUsed !== undefined && { outputTokensUsed: data.outputTokensUsed }),

            ...(data.isProcessedByLlm !== undefined && {
                processedAt: data.isProcessedByLlm ? new Date() : null
            }),
        },
    });

    logger.info(`Candidate paper updated: ${paperId} in project: ${projectId}`);

    return toSafeCandidatePaper(updatedPaper);
}

/**
 * Delete a candidate paper
 * 
 * @param projectId - ID of the project
 * @param paperId - ID of the paper to delete
 * @param userId - ID of the user (for authorization check)
 * @returns Success message
 * @throws {Error} If paper not found or user doesn't own project
 */
export async function deleteCandidatePaper(
    projectId: string,
    paperId: string,
    userId: string
): Promise<{ message: string }> {
    // Verify project exists and user owns it
    const project = await prisma.userProject.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        throw new Error('Project not found');
    }

    if (project.userId !== userId) {
        throw new Error('You do not have permission to delete papers from this project');
    }

    // Verify paper exists and belongs to this project
    const paper = await prisma.candidatePaper.findFirst({
        where: {
            id: paperId,
            projectId,
        },
    });

    if (!paper) {
        throw new Error('Paper not found');
    }

    // Delete the paper
    await prisma.candidatePaper.delete({
        where: { id: paperId },
    });

    logger.info(`Candidate paper deleted: ${paperId} from project: ${projectId}`);

    return { message: 'Paper deleted successfully' };
}
