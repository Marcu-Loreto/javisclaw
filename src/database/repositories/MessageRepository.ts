import { db } from '../db';

export interface Message {
    id?: number;
    conversation_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at?: string;
}

export class MessageRepository {
    create(message: Omit<Message, 'id' | 'created_at'>): Message {
        const stmt = db.prepare('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)');
        const info = stmt.run(message.conversation_id, message.role, message.content);
        
        return {
            ...message,
            id: info.lastInsertRowid as number
        };
    }

    getByConversationId(conversationId: string, limit: number = 50): Message[] {
        const stmt = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT ?');
        return stmt.all(conversationId, limit) as Message[];
    }
}
