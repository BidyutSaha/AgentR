/**
 * LLM Provider Interface
 * Abstraction layer for different LLM providers (OpenAI, Groq, local models, etc.)
 */

export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LLMCompletionOptions {
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
}

export interface LLMResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    modelName?: string;
    durationMs?: number;
    requestId?: string;
}

export interface LLMProvider {
    complete(messages: LLMMessage[], options?: LLMCompletionOptions): Promise<LLMResponse>;
    embed(text: string): Promise<number[]>;
}
