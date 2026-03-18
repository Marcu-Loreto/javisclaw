import Database from 'better-sqlite3';
import path from 'path';

// Singleton for the database connection
class DatabaseConnection {
    private static instance: Database.Database;

    private constructor() { }

    public static getInstance(): Database.Database {
        if (!DatabaseConnection.instance) {
            const dbPath = path.resolve(__dirname, '../../data/db.sqlite');
            DatabaseConnection.instance = new Database(dbPath, { 
                verbose: process.env.NODE_ENV === 'development' ? console.log : undefined 
            });

            // Enable WAL mode for better performance
            DatabaseConnection.instance.pragma('journal_mode = WAL');

            DatabaseConnection.initializeTables();
        }

        return DatabaseConnection.instance;
    }

    private static initializeTables() {
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

export const db = DatabaseConnection.getInstance();
