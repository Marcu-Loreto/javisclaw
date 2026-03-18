import 'dotenv/config';
import { TelegramInputHandler } from '../src/telegram/TelegramInputHandler';
import fs from 'fs';
import path from 'path';

function checkEnvironment() {
    console.log('[Test-Telegram] Checking environment...');

    const requiredDirs = [
        path.resolve(__dirname, '../../data'),
        path.resolve(__dirname, '../../tmp'),
        path.resolve(__dirname, '../../.agents/skills'),
    ];

    for (const dir of requiredDirs) {
        if (!fs.existsSync(dir)) {
            console.log(`[Test-Telegram] Creating missing directory: ${dir}`);
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    if (!process.env.TELEGRAM_BOT_TOKEN) {
        console.error('[Test-Telegram] CRITICAL ERROR: TELEGRAM_BOT_TOKEN is missing in .env');
        process.exit(1);
    }

    if (!process.env.TELEGRAM_ALLOWED_USER_IDS) {
        console.error('[Test-Telegram] CRITICAL ERROR: TELEGRAM_ALLOWED_USER_IDS is missing in .env');
        process.exit(1);
    }
}

async function runTelegramTest() {
    console.log('=================================');
    console.log('Starting Telegram Setup Test');
    console.log('=================================');

    checkEnvironment();

    try {
        const telegramHandler = new TelegramInputHandler();
        telegramHandler.startPolling();
        console.log('\n✅ Bot is now polling!');
        console.log('👉 Go to your Telegram app and send a message to your bot.');
        console.log('   Expected behavior: the bot should reply and logs will appear here.');
        console.log('   Press Ctrl+C to stop the test.\n');
    } catch (e: any) {
        console.error('[Test-Telegram] Failed to start Agent:', e.message);
        process.exit(1);
    }
}

runTelegramTest();
