"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRepository = void 0;
const db_1 = require("../db");
class MessageRepository {
    create(message) {
        const stmt = db_1.db.prepare('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)');
        const info = stmt.run(message.conversation_id, message.role, message.content);
        return {
            ...message,
            id: info.lastInsertRowid
        };
    }
    getByConversationId(conversationId, limit = 50) {
        const stmt = db_1.db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT ?');
        return stmt.all(conversationId, limit);
    }
}
exports.MessageRepository = MessageRepository;
