"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentController = void 0;
const SkillExecutor_1 = require("../skills/SkillExecutor");
const MemoryManager_1 = require("../database/MemoryManager");
class AgentController {
    executor;
    constructor() {
        this.executor = new SkillExecutor_1.SkillExecutor();
    }
    /**
     * Primary entrypoint from the Telegram handler.
     * Throws an error if userId is not in whitelist.
     */
    async handleIncomingMessage(userId, text, requiresAudio = false) {
        this.validateWhitelist(userId);
        if (text.trim().toLowerCase() === '/reset') {
            MemoryManager_1.memoryManager.resetConversation(userId, process.env.DEFAULT_PROVIDER || 'gemini');
            return { text: "Conversation memory reset.", requiresAudio: false };
        }
        try {
            const reply = await this.executor.executeTurn(userId, text);
            return { text: reply, requiresAudio };
        }
        catch (error) {
            console.error(`[AgentController] Error handling message:`, error);
            return { text: `Internal system error: ${error.message}`, requiresAudio: false };
        }
    }
    validateWhitelist(userId) {
        const allowedIdsString = process.env.TELEGRAM_ALLOWED_USER_IDS || '';
        const allowedIds = allowedIdsString.split(',').map(id => id.trim());
        if (!allowedIds.includes(userId)) {
            console.warn(`[Security] Ignoring unauthorized access attempt from ID: ${userId}`);
            throw new Error('UNAUTHORIZED');
        }
    }
}
exports.AgentController = AgentController;
