import 'dotenv/config';
import { TelegramInputHandler } from './telegram/TelegramInputHandler';
import fs from 'fs';
import path from 'path';

// Quick check for required directories and env vars
function checkEnvironment() {
    console.log('[System] Checking environment...');

    const requiredDirs = [
        path.resolve(__dirname, '../../data'),
        path.resolve(__dirname, '../../tmp'),
        path.resolve(__dirname, '../../.agents/skills'),
    ];

    for (const dir of requiredDirs) {
        if (!fs.existsSync(dir)) {
            console.log(`[System] Creating missing directory: ${dir}`);
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    if (!process.env.TELEGRAM_BOT_TOKEN) {
        console.error('[System] CRITICAL ERROR: TELEGRAM_BOT_TOKEN is missing in .env');
        process.exit(1);
    }

    if (!process.env.TELEGRAM_ALLOWED_USER_IDS) {
        console.error('[System] CRITICAL ERROR: TELEGRAM_ALLOWED_USER_IDS is missing in .env');
        process.exit(1);
    }
    
    if (!process.env.GEMINI_API_KEY && !process.env.DEEPSEEK_API_KEY) {
        console.warn('[System] WARNING: No LLM API KEY found. Bot will not be able to reply properly.');
    }
}

async function bootstrap() {
    console.log('=================================');
    console.log('Starting JavisClaw Agent');
    console.log('=================================');

    checkEnvironment();

    try {
        const telegramHandler = new TelegramInputHandler();
        telegramHandler.startPolling();
    } catch (e: any) {
        console.error('[System] Failed to start Agent:', e.message);
        process.exit(1);
    }
}

// Start the application
bootstrap();
