"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const openai_1 = __importDefault(require("openai"));
class AudioService {
    openai;
    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.warn('[AudioService] OPENAI_API_KEY is not set. Audio processing will fail if called.');
        }
        this.openai = new openai_1.default({ apiKey });
    }
    /**
     * Transcribes an audio file (e.g. .ogg from Telegram) into text using Whisper.
     */
    async transcribeAudio(filePath) {
        if (!process.env.OPENAI_API_KEY)
            throw new Error('OPENAI_API_KEY missing');
        console.log(`[AudioService] Transcribing audio file at ${filePath}...`);
        try {
            const transcription = await this.openai.audio.transcriptions.create({
                file: fs_1.default.createReadStream(filePath),
                model: 'whisper-1',
                language: 'pt', // Assuming primarily Portuguese based on the context
            });
            console.log(`[AudioService] Transcription successful: "${transcription.text}"`);
            return transcription.text;
        }
        catch (error) {
            console.error(`[AudioService] Failed to transcribe audio:`, error);
            throw new Error(`Transcription failed: ${error.message}`);
        }
    }
    /**
     * Synthesizes text into a spoken audio file using TTS-1.
     * Returns the absolute path to the generated temporary audio file.
     */
    async synthesizeSpeech(text) {
        if (!process.env.OPENAI_API_KEY)
            throw new Error('OPENAI_API_KEY missing');
        console.log(`[AudioService] Synthesizing speech for text length: ${text.length}`);
        try {
            // we will chunk it if it's too large, but for now assuming standard assistant replies
            const mp3 = await this.openai.audio.speech.create({
                model: 'tts-1',
                voice: 'alloy', // Can be changing to nova, onyx, etc.
                input: text,
            });
            const buffer = Buffer.from(await mp3.arrayBuffer());
            const fileName = `reply_${(0, uuid_1.v4)()}.mp3`;
            const filePath = path_1.default.resolve(__dirname, '../../../tmp', fileName);
            await fs_1.default.promises.writeFile(filePath, buffer);
            console.log(`[AudioService] Speech synthesized to ${filePath}`);
            return filePath;
        }
        catch (error) {
            console.error(`[AudioService] Failed to synthesize speech:`, error);
            throw new Error(`Speech synthesis failed: ${error.message}`);
        }
    }
}
exports.AudioService = AudioService;
