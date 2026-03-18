"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderFactory = void 0;
const GeminiProvider_1 = require("./GeminiProvider");
const DeepSeekProvider_1 = require("./DeepSeekProvider");
const MockProvider_1 = require("./MockProvider");
const OpenAIProvider_1 = require("./OpenAIProvider");
class ProviderFactory {
    static getProvider(providerName) {
        const name = providerName || process.env.DEFAULT_PROVIDER || 'mock';
        switch (name.toLowerCase()) {
            case 'openai':
                return new OpenAIProvider_1.OpenAIProvider();
            case 'gemini':
                return new GeminiProvider_1.GeminiProvider();
            case 'deepseek':
                return new DeepSeekProvider_1.DeepSeekProvider();
            case 'mock':
                return new MockProvider_1.MockProvider();
            default:
                console.warn(`Provider ${name} not found, falling back to mock provider.`);
                return new MockProvider_1.MockProvider();
        }
    }
}
exports.ProviderFactory = ProviderFactory;
