"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepSeekProvider = void 0;
const openai_1 = __importDefault(require("openai"));
class DeepSeekProvider {
    client;
    model;
    constructor() {
        if (!process.env.DEEPSEEK_API_KEY) {
            throw new Error('DEEPSEEK_API_KEY is not defined in the environment.');
        }
        // DeepSeek is OpenAI compatible
        this.client = new openai_1.default({
            apiKey: process.env.DEEPSEEK_API_KEY,
            baseURL: 'https://api.deepseek.com/v1',
        });
        this.model = 'deepseek-chat';
    }
    async generateContent(systemPrompt, history, tools) {
        const messages = [
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
            tools: requestTools,
            tool_choice: requestTools ? 'auto' : undefined,
            stream: false
        });
        const choice = response.choices[0];
        const message = choice.message;
        let parsedToolCalls = undefined;
        if (message.tool_calls && message.tool_calls.length > 0) {
            parsedToolCalls = message.tool_calls.map((call) => ({
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
exports.DeepSeekProvider = DeepSeekProvider;
