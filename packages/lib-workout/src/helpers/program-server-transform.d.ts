/**
 * Workout Program Server-Side Transform Utilities
 *
 * Functions that require server-only services (database access, etc.)
 * These functions are only executed server-side when called from API routes
 * or server components, even if imported in files that may be used in client components.
 *
 * NOTE: This file does not use 'server-only' because it's imported by chat-tools.ts
 * which may be used in client components. The functions themselves are only executed
 * server-side when called.
 */
import type { WorkoutProgram } from '@onecoach/types';
/**
 * Normalize workout payload and convert goal names to IDs (async version)
 * Used in backend where we need to ensure goals are saved as IDs
 *
 * IMPORTANT: This function is server-only and should only be called from API routes
 */
export declare function normalizeAgentWorkoutPayload(payload: unknown, base?: Partial<WorkoutProgram>): Promise<WorkoutProgram>;
//# sourceMappingURL=program-server-transform.d.ts.map