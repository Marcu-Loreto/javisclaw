import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

export class AudioService {
    private openai: OpenAI;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.warn('[AudioService] OPENAI_API_KEY is not set. Audio processing will fail if called.');
        }
        this.openai = new OpenAI({ apiKey });
    }

    /**
     * Transcribes an audio file (e.g. .ogg from Telegram) into text using Whisper.
     */
    public async transcribeAudio(filePath: string): Promise<string> {
        if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing');
        
        console.log(`[AudioService] Transcribing audio file at ${filePath}...`);
        
        try {
            const transcription = await this.openai.audio.transcriptions.create({
                file: fs.createReadStream(filePath),
                model: 'whisper-1',
                language: 'pt', // Assuming primarily Portuguese based on the context
            });

            console.log(`[AudioService] Transcription successful: "${transcription.text}"`);
            return transcription.text;
        } catch (error: any) {
            console.error(`[AudioService] Failed to transcribe audio:`, error);
            throw new Error(`Transcription failed: ${error.message}`);
        }
    }

    /**
     * Synthesizes text into a spoken audio file using TTS-1.
     * Returns the absolute path to the generated temporary audio file.
     */
    public async synthesizeSpeech(text: string): Promise<string> {
        if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing');

        console.log(`[AudioService] Synthesizing speech for text length: ${text.length}`);

        try {
            // we will chunk it if it's too large, but for now assuming standard assistant replies
            const mp3 = await this.openai.audio.speech.create({
                model: 'tts-1',
                voice: 'alloy', // Can be changing to nova, onyx, etc.
                input: text,
            });

            const buffer = Buffer.from(await mp3.arrayBuffer());
            const fileName = `reply_${uuidv4()}.mp3`;
            const filePath = path.resolve(__dirname, '../../../tmp', fileName);
            
            await fs.promises.writeFile(filePath, buffer);
            console.log(`[AudioService] Speech synthesized to ${filePath}`);
            
            return filePath;
        } catch (error: any) {
            console.error(`[AudioService] Failed to synthesize speech:`, error);
            throw new Error(`Speech synthesis failed: ${error.message}`);
        }
    }
}
