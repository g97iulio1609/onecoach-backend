import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createXai } from '@ai-sdk/xai';
import { createMinimax } from 'vercel-minimax-ai-provider';
import { getOpenRouterConfig, getAIProviderKey } from '../config/env';

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

    // NOTE: Provider routing (order, allow_fallbacks) should be passed at request time
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
   * Get a model instance from a provider
   * Simplifies the logic found in various places: provider(modelName)
   */
  public static getModel(providerName: AIProviderType, modelName: string, config?: { apiKey?: string; preferredProvider?: string | null }) {
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
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }
}
