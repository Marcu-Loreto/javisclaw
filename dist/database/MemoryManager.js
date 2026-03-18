"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryManager = exports.MemoryManager = void 0;
const ConversationRepository_1 = require("./repositories/ConversationRepository");
const MessageRepository_1 = require("./repositories/MessageRepository");
class MemoryManager {
    conversationRepo;
    messageRepo;
    constructor() {
        this.conversationRepo = new ConversationRepository_1.ConversationRepository();
        this.messageRepo = new MessageRepository_1.MessageRepository();
    }
    /**
     * Gets the active conversation for a user, or creates a new one.
     */
    getOrCreateConversation(userId, provider) {
        let conversation = this.conversationRepo.getLatestByUserId(userId);
        if (!conversation) {
            conversation = this.conversationRepo.create(userId, provider);
        }
        return conversation;
    }
    /**
     * Adds a message to the conversation.
     */
    addMessage(conversationId, role, content) {
        return this.messageRepo.create({
            conversation_id: conversationId,
            role,
            content
        });
    }
    /**
     * Retrieves the history of a conversation formatted for the LLM.
     */
    getConversationHistory(conversationId, limit = 50) {
        const messages = this.messageRepo.getByConversationId(conversationId, limit);
        return messages.map(m => ({
            role: m.role,
            content: m.content
        }));
    }
    /**
     * Resets the context by creating a new conversation.
     */
    resetConversation(userId, provider) {
        return this.conversationRepo.create(userId, provider);
    }
}
exports.MemoryManager = MemoryManager;
// Export a singleton instance for ease of use
exports.memoryManager = new MemoryManager();
