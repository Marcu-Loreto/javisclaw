import { ILlmProvider, LlmMessage, LlmResponse } from './ILlmProvider';
import { BaseTool } from '../tools/BaseTool';
import { GoogleGenAI } from '@google/genai';

export class GeminiProvider implements ILlmProvider {
    private client: GoogleGenAI;
    private model: string;

    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not defined in the environment.');
        }
        // Initialize the new Google Gen AI SDK
        this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        this.model = 'gemini-2.5-flash'; // default model
    }

    async generateContent(systemPrompt: string, history: LlmMessage[], tools?: BaseTool[]): Promise<LlmResponse> {
        // Map history to the format expected by the exact version of the beta SDK
        // Role should be 'user' or 'model' in Gemini SDK
        const contents = history.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : msg.role === 'system' ? 'user' : 'user', // System must go as part of input or config
            parts: [{ text: msg.content }]
        }));

        const toolDeclarations = tools?.map(tool => tool.getFunctionDeclaration());

        const requestConfig: any = {
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            }
        };

        if (toolDeclarations && toolDeclarations.length > 0) {
            requestConfig.tools = [{
                functionDeclarations: toolDeclarations
            }];
        }

        const response = await this.client.models.generateContent({
             model: this.model,
             contents: contents,
             config: requestConfig
        });

        // Parse tool calls
        let parsedToolCalls = undefined;
        if (response.functionCalls && response.functionCalls.length > 0) {
            parsedToolCalls = response.functionCalls.map(call => ({
                id: Math.random().toString(36).substring(7),
                name: call.name || '',
                args: call.args as Record<string, any>
            }));
        }

        return {
            content: response.text ? response.text : null,
            toolCalls: parsedToolCalls
        };
    }
}
