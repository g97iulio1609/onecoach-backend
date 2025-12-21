/**
 * AI System Constants
 *
 * Centralized constants for AI agents and model configuration.
 */
/**
 * Model Configuration
 */
export declare const MODEL_CONSTANTS: {
    /** Default temperature for general chat and generation */
    readonly DEFAULT_TEMPERATURE: 1;
    /** Temperature for intent detection (lower = more deterministic) */
    readonly INTENT_DETECTION_TEMPERATURE: 0.3;
    /** Max tokens for reasoning mode with extended thinking */
    readonly REASONING_MAX_TOKENS: 16000;
    /** Max tokens for intent detection */
    readonly INTENT_DETECTION_MAX_TOKENS: 2048;
};
/**
 * Provider names
 */
export type ProviderName = 'openai' | 'openrouter' | 'anthropic' | 'google';
/**
 * Model configuration interface
 */
export interface ModelConfig {
    provider: ProviderName;
    model: string;
    maxTokens: number;
    temperature: number;
    reasoningEnabled?: boolean;
    creditsPerRequest?: number;
}
