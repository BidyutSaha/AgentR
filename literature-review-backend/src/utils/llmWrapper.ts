import OpenAI from 'openai';
import { logLlmUsage, LogLlmUsageInput } from '../services/llmUsage/llmUsage.service';
import logger from '../config/logger';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface LlmCallOptions {
    userId: string;
    projectId?: string;
    paperId?: string;
    stage: string;
    model?: string;
    messages: OpenAI.Chat.ChatCompletionMessageParam[];
    temperature?: number;
    maxTokens?: number;
}

/**
 * Wrapper for OpenAI API calls that automatically tracks usage
 * 
 * This function:
 * 1. Makes the OpenAI API call
 * 2. Measures duration
 * 3. Logs usage to database for billing
 * 4. Returns the response
 */
export async function callLlmWithTracking(options: LlmCallOptions) {
    const startTime = Date.now();
    const modelName = options.model || 'gpt-4o-mini';

    try {
        const response = await openai.chat.completions.create({
            model: modelName,
            messages: options.messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens,
        });

        const durationMs = Date.now() - startTime;
        const usage = response.usage;

        if (!usage) {
            logger.warn('No usage data returned from OpenAI');
        }

        // Log usage to database (async, don't wait)
        if (usage) {
            logLlmUsage({
                userId: options.userId,
                projectId: options.projectId,
                paperId: options.paperId,
                stage: options.stage,
                modelName,
                provider: 'openai',
                inputTokens: usage.prompt_tokens,
                outputTokens: usage.completion_tokens,
                durationMs,
                requestId: response.id,
                status: 'success',
            }).catch((error) => {
                logger.error('Failed to log LLM usage:', error);
            });
        }

        return {
            content: response.choices[0]?.message?.content || '',
            usage: usage ? {
                inputTokens: usage.prompt_tokens,
                outputTokens: usage.completion_tokens,
                totalTokens: usage.total_tokens,
            } : null,
            model: response.model,
            requestId: response.id,
            durationMs,
        };
    } catch (error: any) {
        const durationMs = Date.now() - startTime;

        // Log failed attempt
        logLlmUsage({
            userId: options.userId,
            projectId: options.projectId,
            paperId: options.paperId,
            stage: options.stage,
            modelName,
            provider: 'openai',
            inputTokens: 0,
            outputTokens: 0,
            durationMs,
            status: 'error',
            errorMessage: error.message || 'Unknown error',
            metadata: {
                errorType: error.constructor.name,
                errorCode: error.code,
            },
        }).catch((logError) => {
            logger.error('Failed to log LLM error:', logError);
        });

        throw error;
    }
}

/**
 * Helper to create system and user messages
 */
export function createMessages(systemPrompt: string, userPrompt: string): OpenAI.Chat.ChatCompletionMessageParam[] {
    return [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ];
}

export { openai };
