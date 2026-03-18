"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const TelegramInputHandler_1 = require("./telegram/TelegramInputHandler");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Quick check for required directories and env vars
function checkEnvironment() {
    console.log('[System] Checking environment...');
    const requiredDirs = [
        path_1.default.resolve(__dirname, '../../data'),
        path_1.default.resolve(__dirname, '../../tmp'),
        path_1.default.resolve(__dirname, '../../.agents/skills'),
    ];
    for (const dir of requiredDirs) {
        if (!fs_1.default.existsSync(dir)) {
            console.log(`[System] Creating missing directory: ${dir}`);
            fs_1.default.mkdirSync(dir, { recursive: true });
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
    console.log('Starting SandecoClaw Agent');
    console.log('=================================');
    checkEnvironment();
    try {
        const telegramHandler = new TelegramInputHandler_1.TelegramInputHandler();
        telegramHandler.startPolling();
    }
    catch (e) {
        console.error('[System] Failed to start Agent:', e.message);
        process.exit(1);
    }
}
// Start the application
bootstrap();
