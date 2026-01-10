import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createXai } from '@ai-sdk/xai';
import { createMinimax } from 'vercel-minimax-ai-provider';
// Note: ai-sdk-provider-gemini-cli uses native modules (node-pty) incompatible with Next.js bundling
// Import is done dynamically in createGeminiCli to avoid build-time bundling
import { getOpenRouterConfig, getAIProviderKey } from '../config/env';

/** Gemini CLI thinkingLevel for Gemini 3 models */
export type GeminiThinkingLevel = 'minimal' | 'low' | 'medium' | 'high';

/**
 * AI Provider Types
 */
export type AIProviderType = 'openrouter' | 'openai' | 'anthropic' | 'google' | 'xai' | 'minimax' | 'gemini-cli';

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
export class AIProviderFactory {
  /**
   * Create an OpenRouter provider with standard attribution headers
   */
  public static createOpenRouter(config?: Partial<ProviderConfig> & { preferredProvider?: string | null }) {
    const envConfig = getOpenRouterConfig();
    const apiKey = config?.apiKey || envConfig.apiKey;
    
    if (!apiKey) {
      throw new Error('OpenRouter API key is missing. Please set OPENROUTER_API_KEY environment variable.');
    }

    // NOTE: Provider routing (order, allowFallbacks) should be passed at request time
    // via providerOptions.openrouter.provider, NOT at factory level.
    // See: https://openrouter.ai/docs/features/provider-routing
    // The buildProviderOptions utility handles this correctly.
    return (createOpenRouter as any)({
      apiKey,
      baseURL: config?.baseUrl || envConfig.baseUrl,
      headers: {
        'HTTP-Referer': config?.siteUrl || envConfig.siteUrl || 'https://onecoach.ai',
        'X-Title': config?.appName || envConfig.appName || 'onecoach AI',
      },
    });
  }

  /**
   * Create an OpenAI provider
   */
  public static createOpenAI(apiKey?: string): any {
    const key = apiKey || getAIProviderKey('openai');
    return (createOpenAI as any)({ apiKey: key });
  }

  /**
   * Create an Anthropic provider
   */
  public static createAnthropic(apiKey?: string): any {
    const key = apiKey || getAIProviderKey('anthropic');
    return (createAnthropic as any)({ apiKey: key });
  }

  /**
   * Create a Google provider
   */
  public static createGoogle(apiKey?: string): any {
    const key = apiKey || getAIProviderKey('google');
    return (createGoogleGenerativeAI as any)({ apiKey: key });
  }

  /**
   * Create an xAI provider
   */
  public static createXAI(apiKey?: string): any {
    const key = apiKey || getAIProviderKey('xai');
    return (createXai as any)({ apiKey: key });
  }

  /**
   * Create a MiniMax provider using official vercel-minimax-ai-provider
   * https://github.com/MiniMax-AI/vercel-minimax-ai-provider
   */
  public static createMiniMax(apiKey?: string): any {
    const key = apiKey || getAIProviderKey('minimax');
    // Official provider uses Anthropic-compatible API by default
    // which provides better support for advanced features
    return createMinimax({ apiKey: key });
  }

  /**
   * Create a Gemini CLI provider
   * Uses Gemini CLI OAuth (default) or API key authentication
   * Requires: npm install -g @google/gemini-cli && gemini (for OAuth setup)
   * @see https://ai-sdk.dev/providers/community-providers/gemini-cli
   * 
   * NOTE: Uses dynamic import because gemini-cli-core has native node-pty dependencies
   * that are incompatible with Next.js Turbopack bundling.
   */
  public static async createGeminiCli(config?: {
    authType?: 'oauth-personal' | 'api-key';
    apiKey?: string;
    thinkingLevel?: GeminiThinkingLevel;
  }): Promise<any> {
    // Dynamic import to avoid Turbopack bundling native modules
    const { createGeminiProvider } = await import('@onecoach/ai-sdk-provider-gemini-cli');
    return createGeminiProvider({
      authType: config?.authType ?? 'oauth-personal',
      ...(config?.apiKey && { apiKey: config.apiKey }),
    });
  }

  /**
   * Get a model instance from a provider
   * Simplifies the logic found in various places: provider(modelName)
   * NOTE: This method is async because gemini-cli uses dynamic imports
   */
  public static async getModel(
    providerName: AIProviderType,
    modelName: string,
    config?: {
      apiKey?: string;
      preferredProvider?: string | null;
      thinkingLevel?: GeminiThinkingLevel;
    }
  ) {
    switch (providerName) {
      case 'openrouter':
        return (this.createOpenRouter({ apiKey: config?.apiKey, preferredProvider: config?.preferredProvider }) as any)(modelName);
      case 'openai':
        return (this.createOpenAI(config?.apiKey) as any)(modelName);
      case 'anthropic':
        return (this.createAnthropic(config?.apiKey) as any)(modelName);
      case 'google':
        return (this.createGoogle(config?.apiKey) as any)(modelName);
      case 'xai':
        return (this.createXAI(config?.apiKey) as any)(modelName);
      case 'minimax':
        return (this.createMiniMax(config?.apiKey) as any)(modelName);
      case 'gemini-cli': {
        const provider = await this.createGeminiCli({ apiKey: config?.apiKey, thinkingLevel: config?.thinkingLevel });
        return provider(
          modelName,
          config?.thinkingLevel ? { thinkingConfig: { thinkingLevel: config.thinkingLevel } } : undefined
        );
      }
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }
}
