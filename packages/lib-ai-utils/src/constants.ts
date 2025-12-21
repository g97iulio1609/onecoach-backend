/**
 * AI System Constants
 *
 * Centralized constants for AI agents and model configuration.
 */

/**
 * Model Configuration
 */
export const MODEL_CONSTANTS = {
    /** Default temperature for general chat and generation */
    DEFAULT_TEMPERATURE: 1,
    /** Temperature for intent detection (lower = more deterministic) */
    INTENT_DETECTION_TEMPERATURE: 0.3,
    /** Max tokens for reasoning mode with extended thinking */
    REASONING_MAX_TOKENS: 32768,
    /** Reasoning effort level for supported models */
    REASONING_EFFORT: 'high',
    /** Max tokens for intent detection */
    INTENT_DETECTION_MAX_TOKENS: 2048,
} as const;

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
    reasoningEffort?: 'low' | 'medium' | 'high';
    creditsPerRequest?: number;
}
