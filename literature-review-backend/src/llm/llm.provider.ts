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

export interface LLMProvider {
    complete(messages: LLMMessage[], options?: LLMCompletionOptions): Promise<string>;
    embed(text: string): Promise<number[]>;
}

export interface LLMResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
