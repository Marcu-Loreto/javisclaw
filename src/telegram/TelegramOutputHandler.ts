import { Context, InputFile } from 'grammy';

export class TelegramOutputHandler {
    private ctx: Context;
    private MAX_MESSAGE_LENGTH = 4000; // Telegram limit is 4096, leaving buffer

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    /**
     * Sends a chat action (e.g. 'typing'). 
     * Handles 429 errors silently but logs them.
     */
    public async sendChatAction(action: 'typing' | 'upload_document' | 'record_voice') {
        try {
            await this.ctx.replyWithChatAction(action);
        } catch (e: any) {
            console.warn(`[TelegramOutput] Chat action failed:`, e.message);
        }
    }

    /**
     * Sends text, splitting automatically if it exceeds max lengths.
     */
    public async sendText(text: string) {
        if (!text || text.trim() === '') return;

        if (text.length <= this.MAX_MESSAGE_LENGTH) {
            await this.ctx.reply(text, { parse_mode: 'Markdown' }).catch(err => {
                 // Fallback without markdown if parsing fails. Very common when LLM creates unescaped chars.
                 console.warn(`[TelegramOutput] Markdown parse failed, sending plain. Error: ${err.message}`);
                 return this.ctx.reply(text);
            });
        } else {
            console.log(`[TelegramOutput] Splitting long message of length ${text.length}`);
            // Splitting strategy based on newline characters if possible
            const chunks = this.splitMessage(text);
            for (const chunk of chunks) {
                await this.ctx.reply(chunk); // Sending plain to avoid unbalanced markdown split over parts
                // Small delay to keep telegram ordering
                await new Promise(r => setTimeout(r, 100));
            }
        }
    }

    /**
     * Helper to chunk string
     */
    private splitMessage(text: string): string[] {
        const chunks: string[] = [];
        let index = 0;
        while (index < text.length) {
            chunks.push(text.slice(index, index + this.MAX_MESSAGE_LENGTH));
            index += this.MAX_MESSAGE_LENGTH;
        }
        return chunks;
    }

    /**
     * Sends a file to the user.
     */
    public async sendFile(filePath: string, filename?: string) {
        try {
            const inputFile = new InputFile(filePath, filename);
            await this.ctx.replyWithDocument(inputFile);
        } catch (e: any) {
            console.error(`[TelegramOutput] Failed to send document ${filePath}`, e);
            await this.ctx.reply(`Failed to attach document: ${e.message}`);
        }
    }

    /**
     * Sends a voice message to the user.
     */
    public async sendVoice(filePath: string) {
        try {
            const inputFile = new InputFile(filePath);
            await this.ctx.replyWithVoice(inputFile);
        } catch (e: any) {
            console.error(`[TelegramOutput] Failed to send voice message ${filePath}`, e);
            await this.ctx.reply(`Failed to attach voice message: ${e.message}`);
        }
    }
}
