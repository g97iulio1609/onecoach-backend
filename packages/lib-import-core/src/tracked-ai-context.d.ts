/**
 * Tracked AI Context Factory
 *
 * Creates an AI context wrapper that adds logging around delegate calls.
 * Follows DRY principle by centralizing logging logic used across import routes.
 *
 * @module lib-import-core/tracked-ai-context
 */
import type { AIParseContext } from './types';
export interface TrackedAIContextOptions {
    /** Unique request identifier for log correlation */
    requestId: string;
    /** User ID for log context */
    userId: string;
    /** Logger prefix (e.g., 'WorkoutImportAI', 'NutritionImportAI') */
    loggerPrefix: string;
}
/**
 * Wraps an AIParseContext delegate with logging.
 * Logs request start, success with metadata, and failures.
 *
 * @param delegate - The underlying AI context to wrap
 * @param options - Logging configuration
 * @returns Wrapped AIParseContext with logging
 *
 * @example
 * const trackedContext = createTrackedAIContext(
 *   createWorkoutAIContext(),
 *   { requestId, userId, loggerPrefix: 'WorkoutImportAI' }
 * );
 */
export declare function createTrackedAIContext<T>(delegate: AIParseContext<T>, options: TrackedAIContextOptions): AIParseContext<T>;
