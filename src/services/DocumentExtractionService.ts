import fs from 'fs';
const pdfParse = require('pdf-parse');

export class DocumentExtractionService {
    
    /**
     * Extrai o texto de um arquivo PDF local usando a biblioteca pdf-parse.
     * @param filePath O caminho absoluto do arquivo PDF.
     * @returns Um texto formatado com o conteúdo extraído.
     */
    public async extractTextFromPdf(filePath: string): Promise<string> {
        console.log(`[DocumentExtraction] Extracting text from PDF: ${filePath}`);
        try {
            const dataBuffer = await fs.promises.readFile(filePath);
            const data = await pdfParse(dataBuffer);
            return data.text || '';
        } catch (error: any) {
            console.error('[DocumentExtraction] Failed to parse PDF:', error);
            throw new Error(`Falha ao ler o PDF: ${error.message}`);
        }
    }

    /**
     * Extrai o texto de um arquivo Markdown (.md) ou texto plano, lendo diretamente.
     * @param filePath O caminho absoluto do arquivo .md.
     * @returns O conteúdo do arquivo em string.
     */
    public async extractTextFromMd(filePath: string): Promise<string> {
        console.log(`[DocumentExtraction] Extracting text from Markdown/Text: ${filePath}`);
        try {
            const textContent = await fs.promises.readFile(filePath, 'utf-8');
            return textContent;
        } catch (error: any) {
            console.error('[DocumentExtraction] Failed to read Markdown file:', error);
            throw new Error(`Falha ao ler o arquivo .md: ${error.message}`);
        }
    }
}
