import { getOpenAIProvider } from '../../llm/openai.provider';
import { SYSTEM_PROMPT, USER_PROMPT } from '../../prompts/prompts.stage5';
import { CategorizeRequest, CategorizeFullOutput, categorizeOutputSchema } from './categorize.schema';
import logger from '../../config/logger';
import { AppError, ErrorCode } from '../../middlewares/errorHandler';
import { LlmUsageMetadata } from '../../types/api';

export async function processCategorize(request: CategorizeRequest): Promise<{
    output: CategorizeFullOutput;
    usage?: LlmUsageMetadata;
}> {
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
        const llmResponse = await llmProvider.complete(messages, {
            temperature: 0.4, // Slightly higher for nuanced evaluation
            jsonMode: true,
        });

        // Parse JSON response
        let parsedResponse: any;
        try {
            parsedResponse = JSON.parse(llmResponse.content);
        } catch (parseError) {
            logger.error({
                action: 'paper_scoring_json_parse_error',
                response: llmResponse.content,
                error: parseError,
            });
            throw new AppError(
                ErrorCode.LLM_ERROR,
                'Failed to parse LLM response as JSON',
                500,
                { response: llmResponse.content }
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

        // Extract usage metadata
        const usage: LlmUsageMetadata | undefined = llmResponse.usage ? {
            modelName: llmResponse.modelName || 'unknown',
            inputTokens: llmResponse.usage.promptTokens,
            outputTokens: llmResponse.usage.completionTokens,
            totalTokens: llmResponse.usage.totalTokens,
            durationMs: llmResponse.durationMs,
            requestId: llmResponse.requestId,
        } : undefined;

        return {
            output: validatedOutput,
            usage,
        };
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
