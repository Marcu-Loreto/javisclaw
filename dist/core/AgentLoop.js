"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentLoop = void 0;
const MemoryManager_1 = require("../database/MemoryManager");
const ProviderFactory_1 = require("../providers/ProviderFactory");
const ToolRegistry_1 = require("../tools/ToolRegistry");
class AgentLoop {
    provider;
    constructor() {
        this.provider = ProviderFactory_1.ProviderFactory.getProvider();
    }
    /**
     * Executes the ReAct loop for a given user message.
     */
    async run(userId, userMessage, targetSkillContent, currentSkills) {
        const providerName = process.env.DEFAULT_PROVIDER || 'gemini';
        const conversation = MemoryManager_1.memoryManager.getOrCreateConversation(userId, providerName);
        // Log user message
        MemoryManager_1.memoryManager.addMessage(conversation.id, 'user', userMessage);
        const MAX_ITERATIONS = parseInt(process.env.MAX_ITERATIONS || '5', 10);
        let currentIteration = 0;
        // Base System Prompt, injecting skill content if available
        let systemPrompt = `You are SandecoClaw, a helpful personal AI assistant. 
Follow instructions carefully. If a skill provides instructions, follow them strictly.

Available Tools: The user has various tools configured. Look at the function declarations you have access to.

Available Skills you know about:
${currentSkills.map(s => `- ${s.metadata.name}: ${s.metadata.description}`).join('\n')}
`;
        if (targetSkillContent) {
            systemPrompt += `\n\n--- INSTRUCTIONS FOR CURRENT SKILL ---\n${targetSkillContent}\n--- END OF SKILL INSTRUCTIONS ---\n`;
        }
        console.log(`[AgentLoop] Starting ReAct loop for ${userId}. Target skill? ${!!targetSkillContent}`);
        while (currentIteration < MAX_ITERATIONS) {
            currentIteration++;
            console.log(`[AgentLoop] Iteration ${currentIteration}/${MAX_ITERATIONS}`);
            const history = MemoryManager_1.memoryManager.getConversationHistory(conversation.id);
            const tools = ToolRegistry_1.toolRegistry.getAllTools();
            try {
                const response = await this.provider.generateContent(systemPrompt, history, tools);
                // Thought
                if (response.content) {
                    console.log(`[AgentLoop] Thought/Response: ${response.content.substring(0, 100)}...`);
                    MemoryManager_1.memoryManager.addMessage(conversation.id, 'assistant', response.content);
                }
                // Action
                if (response.toolCalls && response.toolCalls.length > 0) {
                    for (const call of response.toolCalls) {
                        console.log(`[AgentLoop] Action Call: ${call.name} with args`, call.args);
                        const tool = ToolRegistry_1.toolRegistry.getTool(call.name);
                        // Observation
                        let observationString = '';
                        if (tool) {
                            try {
                                const toolResult = await tool.execute(call.args);
                                observationString = `[TOOL EXECUTION RESULT (${call.name})]: ${toolResult}`;
                            }
                            catch (error) {
                                observationString = `[TOOL EXECUTION ERROR (${call.name})]: ${error.message}`;
                            }
                        }
                        else {
                            observationString = `[TOOL EXECUTION ERROR]: Tool ${call.name} not found in registry.`;
                        }
                        console.log(`[AgentLoop] Observation: ${observationString.substring(0, 50)}...`);
                        // We push the tool observation as a user message so the LLM context flow understands it
                        // (Depending on SDK, it could be a specialized "tool" role message)
                        MemoryManager_1.memoryManager.addMessage(conversation.id, 'user', observationString);
                    }
                }
                else {
                    // No further tool calls, loop ends with the final response
                    return response.content || "Empty response from provider.";
                }
            }
            catch (error) {
                console.error(`[AgentLoop] Provider iteration error:`, error);
                return `Error during processing: ${error.message}`;
            }
        }
        const msg = "Sorry, I reached the maximum number of iterations trying to solve this task.";
        MemoryManager_1.memoryManager.addMessage(conversation.id, 'assistant', msg);
        return msg;
    }
}
exports.AgentLoop = AgentLoop;
