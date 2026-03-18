import { ConversationRepository, Conversation } from './repositories/ConversationRepository';
import { MessageRepository, Message } from './repositories/MessageRepository';

export class MemoryManager {
    private conversationRepo: ConversationRepository;
    private messageRepo: MessageRepository;

    constructor() {
        this.conversationRepo = new ConversationRepository();
        this.messageRepo = new MessageRepository();
    }

    /**
     * Gets the active conversation for a user, or creates a new one.
     */
    public getOrCreateConversation(userId: string, provider: string): Conversation {
        let conversation = this.conversationRepo.getLatestByUserId(userId);
        
        if (!conversation) {
            conversation = this.conversationRepo.create(userId, provider);
        }
        
        return conversation;
    }

    /**
     * Adds a message to the conversation.
     */
    public addMessage(conversationId: string, role: 'user' | 'assistant' | 'system', content: string): Message {
        return this.messageRepo.create({
            conversation_id: conversationId,
            role,
            content
        });
    }

    /**
     * Retrieves the history of a conversation formatted for the LLM.
     */
    public getConversationHistory(conversationId: string, limit: number = 50): { role: string, content: string }[] {
        const messages = this.messageRepo.getByConversationId(conversationId, limit);
        return messages.map(m => ({
            role: m.role,
            content: m.content
        }));
    }
    
    /**
     * Resets the context by creating a new conversation.
     */
    public resetConversation(userId: string, provider: string): Conversation {
        return this.conversationRepo.create(userId, provider);
    }
}

// Export a singleton instance for ease of use
export const memoryManager = new MemoryManager();
