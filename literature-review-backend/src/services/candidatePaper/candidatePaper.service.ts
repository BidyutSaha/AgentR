import prisma from '../../config/database';
import logger from '../../config/logger';
import { CreateCandidatePaperInput } from './candidatePaper.schema';
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
 * @param projectId - ID of the project to add the paper to
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
    data: Partial<CreateCandidatePaperInput>
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

    // Update the paper (only basic fields can be updated)
    const updatedPaper = await prisma.candidatePaper.update({
        where: { id: paperId },
        data: {
            ...(data.paperTitle && { paperTitle: data.paperTitle }),
            ...(data.paperAbstract && { paperAbstract: data.paperAbstract }),
            ...(data.paperDownloadLink !== undefined && {
                paperDownloadLink: data.paperDownloadLink || null
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
