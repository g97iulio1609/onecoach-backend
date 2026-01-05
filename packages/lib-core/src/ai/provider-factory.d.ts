/**
 * AI Provider Types
 */
export type AIProviderType = 'openrouter' | 'openai' | 'anthropic' | 'google' | 'xai' | 'minimax';
/**
 * Provider Configuration
 */
export interface ProviderConfig {
    type: AIProviderType;
    apiKey?: string;
    baseUrl?: string;
    siteUrl?: string;
    appName?: string;
}
/**
 * AIProviderFactory
 *
 * Centralized factory for creating AI SDK 6 providers.
 * Merges the most up-to-date logic from one-agent and lib-ai-agents.
 */
export declare class AIProviderFactory {
    /**
     * Create an OpenRouter provider with standard attribution headers
     */
    static createOpenRouter(config?: Partial<ProviderConfig> & {
        preferredProvider?: string | null;
    }): any;
    /**
     * Create an OpenAI provider
     */
    static createOpenAI(apiKey?: string): any;
    /**
     * Create an Anthropic provider
     */
    static createAnthropic(apiKey?: string): any;
    /**
     * Create a Google provider
     */
    static createGoogle(apiKey?: string): any;
    /**
     * Create an xAI provider
     */
    static createXAI(apiKey?: string): any;
    /**
     * Create a MiniMax provider (via Anthropic SDK)
     */
    static createMiniMax(apiKey?: string): any;
    /**
     * Get a model instance from a provider
     * Simplifies the logic found in various places: provider(modelName)
     */
    static getModel(providerName: AIProviderType, modelName: string, config?: {
        apiKey?: string;
        preferredProvider?: string | null;
    }): any;
}
