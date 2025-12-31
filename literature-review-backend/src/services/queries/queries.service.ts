import { getOpenAIProvider } from '../../llm/openai.provider';
import { SYSTEM_PROMPT, USER_PROMPT } from '../../prompts/prompts.stage2';
import { QueriesRequest, QueriesOutput, queriesOutputSchema } from './queries.schema';
import logger from '../../config/logger';
import { AppError, ErrorCode } from '../../middlewares/errorHandler';

/**
 * Build user prompt with intent data
 */
function buildUserPrompt(intent: any): string {
    return USER_PROMPT
        .replace('{PROBLEM}', intent.problem)
        .replace('{METHODOLOGIES}', intent.methodologies.join(', '))
        .replace('{APPLICATION_DOMAINS}', intent.applicationDomains.join(', '))
        .replace('{CONSTRAINTS}', intent.constraints.join(', '))
        .replace('{CONTRIBUTION_TYPES}', intent.contributionTypes.join(', '))
        .replace('{KEYWORDS}', intent.keywords_seed.join(', '));
}

export async function processQueries(request: QueriesRequest): Promise<QueriesOutput> {
    try {
        logger.info({
            action: 'queries_processing_start',
            keywordsCount: request.keywords_seed.length,
        });

        const llmProvider = getOpenAIProvider();

        // Build prompts
        const systemPrompt = SYSTEM_PROMPT;
        const userPrompt = buildUserPrompt(request);

        // Create messages for LLM
        const messages = [
            { role: 'system' as const, content: systemPrompt },
            { role: 'user' as const, content: userPrompt },
        ];

        // Call LLM with JSON mode
        const response = await llmProvider.complete(messages, {
            temperature: 0.4, // Slightly higher for more creative query variations
            jsonMode: true,
        });

        // Parse JSON response
        let parsedResponse: any;
        try {
            parsedResponse = JSON.parse(response);
        } catch (parseError) {
            logger.error({
                action: 'queries_json_parse_error',
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

        // Validate response against schema (without abstract)
        const llmOutput = queriesOutputSchema.omit({ abstract: true }).parse(parsedResponse);

        // Combine LLM output with original abstract
        const validatedOutput: QueriesOutput = {
            abstract: request.abstract,
            ...llmOutput,
        };

        logger.info({
            action: 'queries_processing_success',
            expandedKeywordsCount: validatedOutput.expandedKeywords.length,
            booleanQueryLength: validatedOutput.booleanQuery.length,
        });

        return validatedOutput;
    } catch (error: any) {
        logger.error({
            action: 'queries_processing_error',
            error: error.message,
        });

        // Re-throw AppError as-is
        if (error instanceof AppError) {
            throw error;
        }

        // Wrap other errors
        throw new AppError(
            ErrorCode.INTERNAL_ERROR,
            `Query generation failed: ${error.message}`,
            500
        );
    }
}
