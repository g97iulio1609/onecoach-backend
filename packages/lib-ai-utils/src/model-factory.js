/**
 * Model Factory Utility
 *
 * Centralizes AI model creation logic for backend packages.
 * Uses dynamic imports for provider flexibility.
 */
import {} from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { MODEL_CONSTANTS } from './constants';
/**
 * Get an AI language model based on provider
 */
function getProviderModel(options) {
    const { provider, model, apiKey } = options;
    switch (provider) {
        case 'openrouter': {
            // Use OpenAI-compatible API for OpenRouter
            const openrouter = createOpenAI({
                apiKey: apiKey ?? process.env.OPENROUTER_API_KEY,
                baseURL: 'https://openrouter.ai/api/v1',
            });
            return openrouter(model);
        }
        case 'openai': {
            const openai = createOpenAI({
                apiKey: apiKey ?? process.env.OPENAI_API_KEY,
            });
            return openai(model);
        }
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}
/**
 * Creates an AI model instance with the given configuration
 *
 * @param modelConfig - Model configuration (provider, model, maxTokens, temperature)
 * @param apiKey - Optional API key override
 * @param temperatureOverride - Optional temperature override
 * @returns Configured AI model instance
 */
export function createModel(modelConfig, apiKey, temperatureOverride) {
    return getProviderModel({
        provider: modelConfig.provider,
        model: modelConfig.model,
        maxTokens: modelConfig.maxTokens,
        temperature: temperatureOverride ?? modelConfig.temperature,
        apiKey,
    });
}
/**
 * Creates a model instance with reasoning capabilities
 */
export function createReasoningModel(modelConfig, apiKey, enableReasoning = true) {
    const maxTokens = enableReasoning ? MODEL_CONSTANTS.REASONING_MAX_TOKENS : modelConfig.maxTokens;
    return getProviderModel({
        provider: modelConfig.provider,
        model: modelConfig.model,
        maxTokens,
        temperature: modelConfig.temperature,
        apiKey,
    });
}
