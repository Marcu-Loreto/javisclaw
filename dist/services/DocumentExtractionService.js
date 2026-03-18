"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentExtractionService = void 0;
const fs_1 = __importDefault(require("fs"));
const pdfParse = require('pdf-parse');
class DocumentExtractionService {
    /**
     * Extrai o texto de um arquivo PDF local usando a biblioteca pdf-parse.
     * @param filePath O caminho absoluto do arquivo PDF.
     * @returns Um texto formatado com o conteúdo extraído.
     */
    async extractTextFromPdf(filePath) {
        console.log(`[DocumentExtraction] Extracting text from PDF: ${filePath}`);
        try {
            const dataBuffer = await fs_1.default.promises.readFile(filePath);
            const data = await pdfParse(dataBuffer);
            return data.text || '';
        }
        catch (error) {
            console.error('[DocumentExtraction] Failed to parse PDF:', error);
            throw new Error(`Falha ao ler o PDF: ${error.message}`);
        }
    }
    /**
     * Extrai o texto de um arquivo Markdown (.md) ou texto plano, lendo diretamente.
     * @param filePath O caminho absoluto do arquivo .md.
     * @returns O conteúdo do arquivo em string.
     */
    async extractTextFromMd(filePath) {
        console.log(`[DocumentExtraction] Extracting text from Markdown/Text: ${filePath}`);
        try {
            const textContent = await fs_1.default.promises.readFile(filePath, 'utf-8');
            return textContent;
        }
        catch (error) {
            console.error('[DocumentExtraction] Failed to read Markdown file:', error);
            throw new Error(`Falha ao ler o arquivo .md: ${error.message}`);
        }
    }
}
exports.DocumentExtractionService = DocumentExtractionService;
