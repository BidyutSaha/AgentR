import { getOpenAIProvider } from '../../llm/openai.provider';
import { SYSTEM_PROMPT, USER_PROMPT } from '../../prompts/prompts.stage1';
import { IntentRequest, IntentOutput, intentOutputSchema } from './intent.schema';
import logger from '../../config/logger';
import { AppError, ErrorCode } from '../../middlewares/errorHandler';

export async function processIntent(request: IntentRequest): Promise<IntentOutput> {
    try {
        logger.info({
            action: 'intent_processing_start',
            abstractLength: request.abstract.length,
        });

        const llmProvider = getOpenAIProvider();

        // Build prompts
        const systemPrompt = SYSTEM_PROMPT;
        const userPrompt = USER_PROMPT.replace('{ABSTRACT}', request.abstract);

        // Create messages for LLM
        const messages = [
            { role: 'system' as const, content: systemPrompt },
            { role: 'user' as const, content: userPrompt },
        ];

        // Call LLM with JSON mode
        const response = await llmProvider.complete(messages, {
            temperature: 0.3, // Lower temperature for more consistent extraction
            jsonMode: true,
        });

        // Parse JSON response
        let parsedResponse: any;
        try {
            parsedResponse = JSON.parse(response);
        } catch (parseError) {
            logger.error({
                action: 'intent_json_parse_error',
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
        const llmOutput = intentOutputSchema.omit({ abstract: true }).parse(parsedResponse);

        // Combine LLM output with original abstract
        const validatedOutput: IntentOutput = {
            abstract: request.abstract,
            ...llmOutput,
        };

        logger.info({
            action: 'intent_processing_success',
            keywordsCount: validatedOutput.keywords_seed.length,
            methodologiesCount: validatedOutput.methodologies.length,
        });

        return validatedOutput;
    } catch (error: any) {
        logger.error({
            action: 'intent_processing_error',
            error: error.message,
        });

        // Re-throw AppError as-is
        if (error instanceof AppError) {
            throw error;
        }

        // Wrap other errors
        throw new AppError(
            ErrorCode.INTERNAL_ERROR,
            `Intent processing failed: ${error.message}`,
            500
        );
    }
}
