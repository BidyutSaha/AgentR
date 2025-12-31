import axios from 'axios';
import { env } from '../config/env';
import logger from '../config/logger';
import { LLMProvider, LLMMessage, LLMCompletionOptions } from './llm.provider';
import { AppError, ErrorCode } from '../middlewares/errorHandler';

export class OpenAIProvider implements LLMProvider {
    private apiKey: string;
    private model: string;
    private embeddingsModel: string;
    private baseURL = 'https://api.openai.com/v1';

    constructor() {
        this.apiKey = env.openaiApiKey;
        this.model = env.llmModel;
        this.embeddingsModel = env.embeddingsModel;

        if (!this.apiKey) {
            throw new Error('OpenAI API key is required');
        }
    }

    async complete(messages: LLMMessage[], options?: LLMCompletionOptions): Promise<string> {
        try {
            const requestBody: any = {
                model: this.model,
                messages: messages,
                // temperature: options?.temperature ?? 0.7,
            };

            if (options?.maxTokens) {
                requestBody.max_tokens = options.maxTokens;
            }

            if (options?.jsonMode) {
                requestBody.response_format = { type: 'json_object' };
            }

            logger.info({
                action: 'openai_completion_request',
                model: this.model,
                messageCount: messages.length,
            });

            const response = await axios.post(`${this.baseURL}/chat/completions`, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                },
                timeout: 60000, // 60 second timeout
            });

            const content = response.data.choices[0]?.message?.content;

            if (!content) {
                throw new Error('No content in OpenAI response');
            }

            logger.info({
                action: 'openai_completion_success',
                usage: response.data.usage,
            });

            return content;
        } catch (error: any) {
            logger.error({
                action: 'openai_completion_error',
                error: error.message,
                response: error.response?.data,
            });

            if (error.response?.status === 401) {
                throw new AppError(
                    ErrorCode.LLM_ERROR,
                    'Invalid OpenAI API key',
                    401,
                    error.response?.data
                );
            }

            if (error.response?.status === 429) {
                throw new AppError(
                    ErrorCode.LLM_ERROR,
                    'OpenAI rate limit exceeded',
                    429,
                    error.response?.data
                );
            }

            throw new AppError(
                ErrorCode.LLM_ERROR,
                `OpenAI API error: ${error.message}`,
                500,
                error.response?.data
            );
        }
    }

    async embed(text: string): Promise<number[]> {
        try {
            logger.info({
                action: 'openai_embedding_request',
                model: this.embeddingsModel,
                textLength: text.length,
            });

            const response = await axios.post(
                `${this.baseURL}/embeddings`,
                {
                    model: this.embeddingsModel,
                    input: text,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.apiKey}`,
                    },
                    timeout: 30000,
                }
            );

            const embedding = response.data.data[0]?.embedding;

            if (!embedding) {
                throw new Error('No embedding in OpenAI response');
            }

            logger.info({
                action: 'openai_embedding_success',
                dimensions: embedding.length,
            });

            return embedding;
        } catch (error: any) {
            logger.error({
                action: 'openai_embedding_error',
                error: error.message,
                response: error.response?.data,
            });

            throw new AppError(
                ErrorCode.LLM_ERROR,
                `OpenAI Embedding API error: ${error.message}`,
                500,
                error.response?.data
            );
        }
    }
}

// Singleton instance
let openAIProviderInstance: OpenAIProvider | null = null;

export function getOpenAIProvider(): OpenAIProvider {
    if (!openAIProviderInstance) {
        openAIProviderInstance = new OpenAIProvider();
    }
    return openAIProviderInstance;
}
