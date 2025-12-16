/**
 * Workout Normalization Service
 *
 * Centralized service for normalizing workout programs and calculating weights
 * based on user's 1RM. Follows SOLID principles with single responsibility.
 */
import type { WorkoutProgram } from '@onecoach/types';
/**
 * Normalize workout program and calculate weights based on user's 1RM
 * @param rawPayload - Raw workout payload from AI agent
 * @param userId - User ID for 1RM lookup (optional)
 * @param baseProgram - Base program data (optional)
 * @returns Normalized workout program with calculated weights
 */
export declare function normalizeWithWeightCalculation(rawPayload: unknown, userId?: string, baseProgram?: Partial<WorkoutProgram>): Promise<WorkoutProgram>;
//# sourceMappingURL=workout-normalization.service.d.ts.map