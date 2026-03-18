import { BaseTool } from '../tools/BaseTool';

export interface LlmMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface LlmResponse {
    content: string | null;
    toolCalls?: {
        id: string;
        name: string;
        args: Record<string, any>;
    }[];
}

export interface ILlmProvider {
    /**
     * Sends a completion request to the LLM
     * @param systemPrompt The system prompt instructing the LLM
     * @param history The conversation history
     * @param tools Optional tools available for the LLM
     */
    generateContent(systemPrompt: string, history: LlmMessage[], tools?: BaseTool[]): Promise<LlmResponse>;
}
