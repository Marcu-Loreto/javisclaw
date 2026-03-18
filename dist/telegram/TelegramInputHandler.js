"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramInputHandler = void 0;
const grammy_1 = require("grammy");
const AgentController_1 = require("../core/AgentController");
const TelegramOutputHandler_1 = require("./TelegramOutputHandler");
const AudioService_1 = require("../services/AudioService");
const DocumentExtractionService_1 = require("../services/DocumentExtractionService");
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class TelegramInputHandler {
    bot;
    controller;
    audioService;
    documentService;
    constructor() {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) {
            throw new Error('TELEGRAM_BOT_TOKEN is not defined in environment variables.');
        }
        this.bot = new grammy_1.Bot(token);
        this.controller = new AgentController_1.AgentController();
        this.audioService = new AudioService_1.AudioService();
        this.documentService = new DocumentExtractionService_1.DocumentExtractionService();
        this.setupHandlers();
    }
    setupHandlers() {
        this.bot.command('start', async (ctx) => {
            const output = new TelegramOutputHandler_1.TelegramOutputHandler(ctx);
            await output.sendText('SandecoClaw Agent is online. How can I help you?');
        });
        // Handle both text and voice via a unified private method
        this.bot.on('message:text', async (ctx) => {
            const userId = ctx.from?.id.toString();
            const text = ctx.message?.text;
            if (!userId || !text)
                return;
            await this.processMessage(ctx, userId, text, false);
        });
        this.bot.on('message:voice', async (ctx) => {
            const userId = ctx.from?.id.toString();
            const voice = ctx.message?.voice;
            if (!userId || !voice)
                return;
            const output = new TelegramOutputHandler_1.TelegramOutputHandler(ctx);
            try {
                await output.sendChatAction('typing');
                // 1. Get the file path from Telegram
                const file = await ctx.api.getFile(voice.file_id);
                const fileLink = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
                // 2. Download it locally
                const localPath = path_1.default.resolve(__dirname, '../../../tmp', `voice_in_${voice.file_id}.ogg`);
                const response = await (0, axios_1.default)({
                    method: 'GET',
                    url: fileLink,
                    responseType: 'stream'
                });
                const writer = fs_1.default.createWriteStream(localPath);
                response.data.pipe(writer);
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
                // 3. Transcribe audio to text
                const transcribedText = await this.audioService.transcribeAudio(localPath);
                // 4. Send to standard processor
                await this.processMessage(ctx, userId, transcribedText, true);
                // Option: Delete the incoming text so it doesn't pile up
                try {
                    fs_1.default.unlinkSync(localPath);
                }
                catch (e) { }
            }
            catch (error) {
                console.error(`Error processing voice from ${userId}:`, error);
                await output.sendText(`Failed to process voice message: ${error.message}`);
            }
        });
        this.bot.on('message:document', async (ctx) => {
            const userId = ctx.from?.id.toString();
            const document = ctx.message?.document;
            const caption = ctx.message?.caption || '';
            if (!userId || !document)
                return;
            const output = new TelegramOutputHandler_1.TelegramOutputHandler(ctx);
            const mimeString = document.mime_type || '';
            const fileName = document.file_name || '';
            const isPdf = mimeString === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
            const isMd = fileName.toLowerCase().endsWith('.md') || mimeString.includes('text/plain');
            if (!isPdf && !isMd) {
                await output.sendText('⚠️ No momento, só consigo processar texto estruturado (.md), áudio e PDF.');
                return;
            }
            // Reject if extremely large (e.g. 20MB limit for general safety)
            if (document.file_size && document.file_size > 20 * 1024 * 1024) {
                await output.sendText('⚠️ O arquivo é grande demais. O limite de processamento de texto é 20MB.');
                return;
            }
            try {
                await output.sendChatAction('typing');
                // 1. Get the file path from Telegram
                const file = await ctx.api.getFile(document.file_id);
                const fileLink = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
                // 2. Download it locally
                const ext = isPdf ? '.pdf' : '.md';
                const localPath = path_1.default.resolve(__dirname, '../../../tmp', `doc_in_${document.file_id}${ext}`);
                const response = await (0, axios_1.default)({
                    method: 'GET',
                    url: fileLink,
                    responseType: 'stream'
                });
                const writer = fs_1.default.createWriteStream(localPath);
                response.data.pipe(writer);
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
                // 3. Extract text
                let extractedText = '';
                try {
                    if (isPdf) {
                        extractedText = await this.documentService.extractTextFromPdf(localPath);
                    }
                    else if (isMd) {
                        extractedText = await this.documentService.extractTextFromMd(localPath);
                    }
                }
                finally {
                    // Try to clean up local doc file even if parsing fails
                    try {
                        fs_1.default.unlinkSync(localPath);
                    }
                    catch (e) { }
                }
                // 4. Send to standard processor with caption context
                const combinedText = `[Arquivo: ${fileName}]\n${extractedText}\n\n[Legenda:] ${caption}`;
                await this.processMessage(ctx, userId, combinedText, false);
            }
            catch (error) {
                console.error(`Error processing document from ${userId}:`, error);
                await output.sendText(`Failed to process document: ${error.message}`);
            }
        });
        // Error handling for grammy polling
        this.bot.catch((err) => {
            console.error('Error in grammy polling:', err);
        });
    }
    async processMessage(ctx, userId, text, requiresAudio) {
        const output = new TelegramOutputHandler_1.TelegramOutputHandler(ctx);
        try {
            await output.sendChatAction('typing');
            // Pass to controller
            const response = await this.controller.handleIncomingMessage(userId, text, requiresAudio);
            // Send text response first
            await output.sendText(response.text);
            // If audio is required, generate and send it
            if (response.requiresAudio) {
                await output.sendChatAction('record_voice');
                try {
                    const audioPath = await this.audioService.synthesizeSpeech(response.text);
                    await output.sendVoice(audioPath);
                    // Cleanup synthesized file
                    try {
                        fs_1.default.unlinkSync(audioPath);
                    }
                    catch (e) { }
                }
                catch (audioErr) {
                    console.error('[System] Failed to generate output audio:', audioErr.message);
                }
            }
        }
        catch (error) {
            if (error.message === 'UNAUTHORIZED') {
                console.log(`Unauthorized user ${userId} tried to interact.`);
                return;
            }
            console.error(`Error processing message from ${userId}:`, error);
            await output.sendText(`A system error occurred: ${error.message}`);
        }
        // Error handling for grammy polling
        this.bot.catch((err) => {
            console.error('Error in grammy polling:', err);
        });
    }
    startPolling() {
        console.log('[TelegramInputHandler] Starting bot polling...');
        this.bot.start();
    }
}
exports.TelegramInputHandler = TelegramInputHandler;
