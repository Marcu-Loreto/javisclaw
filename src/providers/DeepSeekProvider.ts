import { ILlmProvider, LlmMessage, LlmResponse } from './ILlmProvider';
import { BaseTool } from '../tools/BaseTool';
import OpenAI from 'openai';

export class DeepSeekProvider implements ILlmProvider {
    private client: OpenAI;
    private model: string;

    constructor() {
        if (!process.env.DEEPSEEK_API_KEY) {
            throw new Error('DEEPSEEK_API_KEY is not defined in the environment.');
        }
        
        // DeepSeek is OpenAI compatible
        this.client = new OpenAI({
            apiKey: process.env.DEEPSEEK_API_KEY,
            baseURL: 'https://api.deepseek.com/v1',
        });
        this.model = 'deepseek-chat';
    }

    async generateContent(systemPrompt: string, history: LlmMessage[], tools?: BaseTool[]): Promise<LlmResponse> {
        const messages: any[] = [
            { role: 'system', content: systemPrompt },
            ...history.map(msg => ({ role: msg.role, content: msg.content }))
        ];

        let requestTools = undefined;
        if (tools && tools.length > 0) {
            requestTools = tools.map(tool => ({
                type: 'function',
                function: tool.getFunctionDeclaration() // Needs compatible schema mapping later
            }));
        }

        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: messages,
            tools: requestTools as any,
            tool_choice: requestTools ? 'auto' : undefined,
            stream: false
        });

        const choice = response.choices[0];
        const message = choice.message;

        let parsedToolCalls = undefined;
        if (message.tool_calls && message.tool_calls.length > 0) {
            parsedToolCalls = message.tool_calls.map((call: any) => ({
                id: call.id,
                name: call.function.name,
                args: JSON.parse(call.function.arguments)
            }));
        }

        return {
            content: message.content,
            toolCalls: parsedToolCalls
        };
    }
}
