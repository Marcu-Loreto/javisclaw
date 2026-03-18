import { ILlmProvider, LlmMessage, LlmResponse } from './ILlmProvider';
import { BaseTool } from '../tools/BaseTool';
import OpenAI from 'openai';

export class OpenAIProvider implements ILlmProvider {
    private openai: OpenAI;
    private modelName: string;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.warn('[OpenAIProvider] OPENAI_API_KEY is not set. API calls will fail.');
        }

        this.openai = new OpenAI({ apiKey });
        // Using gpt-4o-mini as a fast/cheap standard, or gpt-4o if preferred.
        // Could also read from env OPENAI_MODEL
        this.modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    }

    async generateContent(systemPrompt: string, history: LlmMessage[], tools?: BaseTool[] | undefined): Promise<LlmResponse> {
        
        // Convert local message format to OpenAI format
        const messages: any[] = [
            { role: 'system', content: systemPrompt }
        ];

        for (const msg of history) {
            messages.push({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content
            });
        }

        // Map local tools to OpenAI function calling format if available
        let openaiTools: any[] | undefined = undefined;
        if (tools && tools.length > 0) {
            openaiTools = tools.map((t: BaseTool) => {
                const dec = t.getFunctionDeclaration();
                return {
                    type: 'function',
                    function: {
                        name: dec.name,
                        description: dec.description,
                        parameters: dec.parameters
                    }
                };
            });
        }

        try {
            console.log(`[OpenAIProvider] Sending request to OpenAI using model ${this.modelName}...`);
            const completion = await this.openai.chat.completions.create({
                model: this.modelName,
                messages: messages,
                tools: openaiTools,
                tool_choice: openaiTools ? 'auto' : undefined
            });

            const choice = completion.choices[0];
            const responseMessage = choice.message;

            const response: LlmResponse = {
                content: responseMessage.content || ''
            };

            // Process tool calls if requested by the model
            if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
                response.toolCalls = responseMessage.tool_calls.map((tc: any) => {
                    let parsedArgs: Record<string, any> = {};
                    try {
                        parsedArgs = JSON.parse(tc.function.arguments);
                    } catch (e) {
                        console.error('[OpenAIProvider] Failed to parse tool arguments JSON:', tc.function.arguments);
                    }
                    return {
                        id: tc.id,
                        name: tc.function.name,
                        args: parsedArgs
                    };
                });
            }

            return response;
        } catch (error: any) {
            console.error('[OpenAIProvider] Error generating content:', error);
            throw error;
        }
    }
}
