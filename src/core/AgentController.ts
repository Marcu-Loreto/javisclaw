import { SkillExecutor } from '../skills/SkillExecutor';
import { memoryManager } from '../database/MemoryManager';

export interface AgentResponse {
    text: string;
    requiresAudio: boolean;
}

export class AgentController {
    private executor: SkillExecutor;

    constructor() {
        this.executor = new SkillExecutor();
    }

    /**
     * Primary entrypoint from the Telegram handler.
     * Throws an error if userId is not in whitelist.
     */
    public async handleIncomingMessage(userId: string, text: string, requiresAudio: boolean = false): Promise<AgentResponse> {
        this.validateWhitelist(userId);

        if (text.trim().toLowerCase() === '/reset') {
            memoryManager.resetConversation(userId, process.env.DEFAULT_PROVIDER || 'gemini');
            return { text: "Conversation memory reset.", requiresAudio: false };
        }

        try {
            const reply = await this.executor.executeTurn(userId, text);
            return { text: reply, requiresAudio };
        } catch (error: any) {
            console.error(`[AgentController] Error handling message:`, error);
            return { text: `Internal system error: ${error.message}`, requiresAudio: false };
        }
    }

    private validateWhitelist(userId: string): void {
        const allowedIdsString = process.env.TELEGRAM_ALLOWED_USER_IDS || '';
        const allowedIds = allowedIdsString.split(',').map(id => id.trim());

        if (!allowedIds.includes(userId)) {
            console.warn(`[Security] Ignoring unauthorized access attempt from ID: ${userId}`);
            throw new Error('UNAUTHORIZED');
        }
    }
}
