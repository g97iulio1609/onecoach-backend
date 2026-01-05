import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createXai } from '@ai-sdk/xai';
import { getOpenRouterConfig, getAIProviderKey } from '../config/env';
/**
 * AIProviderFactory
 *
 * Centralized factory for creating AI SDK 6 providers.
 * Merges the most up-to-date logic from one-agent and lib-ai-agents.
 */
export class AIProviderFactory {
    /**
     * Create an OpenRouter provider with standard attribution headers
     */
    static createOpenRouter(config) {
        const envConfig = getOpenRouterConfig();
        const apiKey = config?.apiKey || envConfig.apiKey;
        if (!apiKey) {
            throw new Error('OpenRouter API key is missing. Please set OPENROUTER_API_KEY environment variable.');
        }
        const extraBody = config?.preferredProvider
            ? { provider: { only: [config.preferredProvider] } }
            : undefined;
        return createOpenRouter({
            apiKey,
            baseURL: config?.baseUrl || envConfig.baseUrl,
            headers: {
                'HTTP-Referer': config?.siteUrl || envConfig.siteUrl || 'https://onecoach.ai',
                'X-Title': config?.appName || envConfig.appName || 'onecoach AI',
            },
            ...(extraBody ? { extraBody } : {}),
        });
    }
    /**
     * Create an OpenAI provider
     */
    static createOpenAI(apiKey) {
        const key = apiKey || getAIProviderKey('openai');
        return createOpenAI({ apiKey: key });
    }
    /**
     * Create an Anthropic provider
     */
    static createAnthropic(apiKey) {
        const key = apiKey || getAIProviderKey('anthropic');
        return createAnthropic({ apiKey: key });
    }
    /**
     * Create a Google provider
     */
    static createGoogle(apiKey) {
        const key = apiKey || getAIProviderKey('google');
        return createGoogleGenerativeAI({ apiKey: key });
    }
    /**
     * Create an xAI provider
     */
    static createXAI(apiKey) {
        const key = apiKey || getAIProviderKey('xai');
        return createXai({ apiKey: key });
    }
    /**
     * Create a MiniMax provider (via Anthropic SDK)
     */
    static createMiniMax(apiKey) {
        const key = apiKey || getAIProviderKey('minimax');
        return createAnthropic({
            apiKey: key,
            baseURL: 'https://api.minimax.io/anthropic',
        });
    }
    /**
     * Get a model instance from a provider
     * Simplifies the logic found in various places: provider(modelName)
     */
    static getModel(providerName, modelName, config) {
        switch (providerName) {
            case 'openrouter':
                return this.createOpenRouter({ apiKey: config?.apiKey, preferredProvider: config?.preferredProvider })(modelName);
            case 'openai':
                return this.createOpenAI(config?.apiKey)(modelName);
            case 'anthropic':
                return this.createAnthropic(config?.apiKey)(modelName);
            case 'google':
                return this.createGoogle(config?.apiKey)(modelName);
            case 'xai':
                return this.createXAI(config?.apiKey)(modelName);
            case 'minimax':
                return this.createMiniMax(config?.apiKey)(modelName);
            default:
                throw new Error(`Unsupported provider: ${providerName}`);
        }
    }
}
