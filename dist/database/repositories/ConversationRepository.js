"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationRepository = void 0;
const db_1 = require("../db");
const uuid_1 = require("uuid");
class ConversationRepository {
    create(userId, provider) {
        const stmt = db_1.db.prepare('INSERT INTO conversations (id, user_id, provider) VALUES (?, ?, ?)');
        const id = (0, uuid_1.v4)();
        stmt.run(id, userId, provider);
        return this.getById(id);
    }
    getById(id) {
        const stmt = db_1.db.prepare('SELECT * FROM conversations WHERE id = ?');
        return stmt.get(id);
    }
    getByUserId(userId) {
        const stmt = db_1.db.prepare('SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC');
        return stmt.all(userId);
    }
    getLatestByUserId(userId) {
        const stmt = db_1.db.prepare('SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1');
        return stmt.get(userId);
    }
}
exports.ConversationRepository = ConversationRepository;
