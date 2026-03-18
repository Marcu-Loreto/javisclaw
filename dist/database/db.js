"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
// Singleton for the database connection
class DatabaseConnection {
    static instance;
    constructor() { }
    static getInstance() {
        if (!DatabaseConnection.instance) {
            const dbPath = path_1.default.resolve(__dirname, '../../data/db.sqlite');
            DatabaseConnection.instance = new better_sqlite3_1.default(dbPath, {
                verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
            });
            // Enable WAL mode for better performance
            DatabaseConnection.instance.pragma('journal_mode = WAL');
            DatabaseConnection.initializeTables();
        }
        return DatabaseConnection.instance;
    }
    static initializeTables() {
        const db = DatabaseConnection.instance;
        db.exec(`
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                provider TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        db.exec(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
            );
        `);
    }
}
exports.db = DatabaseConnection.getInstance();
