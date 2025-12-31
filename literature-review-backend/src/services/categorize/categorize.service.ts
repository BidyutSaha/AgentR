import { getOpenAIProvider } from '../../llm/openai.provider';
import { SYSTEM_PROMPT, USER_PROMPT } from '../../prompts/prompts.stage5';
import { CategorizeRequest, CategorizeFullOutput, categorizeOutputSchema } from './categorize.schema';
import logger from '../../config/logger';
import { AppError, ErrorCode } from '../../middlewares/errorHandler';

export async function processCategorize(request: CategorizeRequest): Promise<CategorizeFullOutput> {
    try {
        logger.info({
            action: 'paper_scoring_start',
            userAbstractLength: request.userAbstract.length,
            candidateAbstractLength: request.candidateAbstract.length,
        });

        const llmProvider = getOpenAIProvider();

        // Build prompts
        const systemPrompt = SYSTEM_PROMPT;
        const userPrompt = USER_PROMPT
            .replace('{USER_ABSTRACT}', request.userAbstract)
            .replace('{CANDIDATE_ABSTRACT}', request.candidateAbstract);

        // Create messages for LLM
        const messages = [
            { role: 'system' as const, content: systemPrompt },
            { role: 'user' as const, content: userPrompt },
        ];

        // Call LLM with JSON mode
        const response = await llmProvider.complete(messages, {
            temperature: 0.4, // Slightly higher for nuanced evaluation
            jsonMode: true,
        });

        // Parse JSON response
        let parsedResponse: any;
        try {
            parsedResponse = JSON.parse(response);
        } catch (parseError) {
            logger.error({
                action: 'paper_scoring_json_parse_error',
                response: response,
                error: parseError,
            });
            throw new AppError(
                ErrorCode.LLM_ERROR,
                'Failed to parse LLM response as JSON',
                500,
                { response }
            );
        }

        // Validate response against schema
        const llmOutput = categorizeOutputSchema.parse(parsedResponse);

        // Combine LLM output with original abstracts
        const validatedOutput: CategorizeFullOutput = {
            userAbstract: request.userAbstract,
            candidateAbstract: request.candidateAbstract,
            ...llmOutput,
        };

        logger.info({
            action: 'paper_scoring_success',
            keywordsCount: validatedOutput.research_gaps.length,
            c1_score: validatedOutput.c1_score,
            c2_score: validatedOutput.c2_score,
        });

        return validatedOutput;
    } catch (error: any) {
        logger.error({
            action: 'paper_scoring_error',
            error: error.message,
        });

        // Re-throw AppError as-is
        if (error instanceof AppError) {
            throw error;
        }

        // Wrap other errors
        throw new AppError(
            ErrorCode.INTERNAL_ERROR,
            `Paper scoring failed: ${error.message}`,
            500
        );
    }
}
