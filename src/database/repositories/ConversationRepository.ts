import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';

export interface Conversation {
    id: string;
    user_id: string;
    provider: string;
    created_at?: string;
}

export class ConversationRepository {
    create(userId: string, provider: string): Conversation {
        const stmt = db.prepare('INSERT INTO conversations (id, user_id, provider) VALUES (?, ?, ?)');
        const id = uuidv4();
        stmt.run(id, userId, provider);
        
        return this.getById(id) as Conversation;
    }

    getById(id: string): Conversation | undefined {
        const stmt = db.prepare('SELECT * FROM conversations WHERE id = ?');
        return stmt.get(id) as Conversation | undefined;
    }

    getByUserId(userId: string): Conversation[] {
        const stmt = db.prepare('SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC');
        return stmt.all(userId) as Conversation[];
    }
    
    getLatestByUserId(userId: string): Conversation | undefined {
        const stmt = db.prepare('SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1');
        return stmt.get(userId) as Conversation | undefined;
    }
}
