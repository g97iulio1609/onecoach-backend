/**
 * Tracked AI Context Factory
 *
 * Creates an AI context wrapper that adds logging around delegate calls.
 * Follows DRY principle by centralizing logging logic used across import routes.
 *
 * @module lib-import-core/tracked-ai-context
 */
import { logger as baseLogger } from '@onecoach/lib-shared/utils/logger';
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
export function createTrackedAIContext(delegate, options) {
    const { requestId, userId, loggerPrefix } = options;
    const aiLogger = baseLogger.child(loggerPrefix);
    return {
        parseWithAI: async (content, mimeType, prompt) => {
            aiLogger.info('AI parse request', {
                requestId,
                userId,
                mimeType,
                contentLength: content?.length,
            });
            try {
                const result = await delegate.parseWithAI(content, mimeType, prompt);
                // Extract metadata for logging (generic approach)
                const metadata = extractResultMetadata(result);
                aiLogger.info('AI parse response', {
                    requestId,
                    userId,
                    mimeType,
                    ...metadata,
                });
                return result;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Errore sconosciuto';
                aiLogger.warn('AI parse failed', { requestId, userId, mimeType, message });
                throw error;
            }
        },
    };
}
/**
 * Extracts loggable metadata from parse results.
 * Handles various result shapes (workout, nutrition, oneagenda).
 */
function extractResultMetadata(result) {
    if (!result || typeof result !== 'object') {
        return {};
    }
    const r = result;
    const metadata = {};
    // Workout-style (weeks -> days -> exercises)
    if (Array.isArray(r.weeks)) {
        metadata.weeks = r.weeks.length;
        metadata.days = r.weeks.reduce((sum, w) => sum + (Array.isArray(w.days) ? w.days.length : 0), 0);
        metadata.exercises = r.weeks.reduce((sum, w) => sum +
            (Array.isArray(w.days)
                ? w.days.reduce((dSum, d) => dSum + (Array.isArray(d.exercises) ? d.exercises.length : 0), 0)
                : 0), 0);
    }
    // OneAgenda-style (projects, tasks, habits)
    if (Array.isArray(r.projects))
        metadata.projects = r.projects.length;
    if (Array.isArray(r.tasks))
        metadata.tasks = r.tasks.length;
    if (Array.isArray(r.habits))
        metadata.habits = r.habits.length;
    return metadata;
}
