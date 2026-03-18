import { ILlmProvider, LlmMessage, LlmResponse } from './ILlmProvider';
import { GeminiProvider } from './GeminiProvider';
import { DeepSeekProvider } from './DeepSeekProvider';
import { MockProvider } from './MockProvider';
import { OpenAIProvider } from './OpenAIProvider';

export class ProviderFactory {
    static getProvider(providerName?: string): ILlmProvider {
        const name = providerName || process.env.DEFAULT_PROVIDER || 'mock';
        
        switch (name.toLowerCase()) {
            case 'openai':
                return new OpenAIProvider();
            case 'gemini':
                return new GeminiProvider();
            case 'deepseek':
                return new DeepSeekProvider();
            case 'mock':
                return new MockProvider();
            default:
                console.warn(`Provider ${name} not found, falling back to mock provider.`);
                return new MockProvider();
        }
    }
}
