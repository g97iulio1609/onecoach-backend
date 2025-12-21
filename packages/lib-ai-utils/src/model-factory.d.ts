/**
 * Model Factory Utility
 *
 * Centralizes AI model creation logic for backend packages.
 * Uses dynamic imports for provider flexibility.
 */
import { type LanguageModel } from 'ai';
import { type ModelConfig } from './constants';
/**
 * Creates an AI model instance with the given configuration
 *
 * @param modelConfig - Model configuration (provider, model, maxTokens, temperature)
 * @param apiKey - Optional API key override
 * @param temperatureOverride - Optional temperature override
 * @returns Configured AI model instance
 */
export declare function createModel(modelConfig: ModelConfig, apiKey?: string, temperatureOverride?: number): LanguageModel;
/**
 * Creates a model instance with reasoning capabilities
 */
export declare function createReasoningModel(modelConfig: ModelConfig, apiKey?: string, enableReasoning?: boolean): LanguageModel;
