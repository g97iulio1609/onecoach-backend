/**
 * Workout Session Mapper
 *
 * Clean mapping functions between Prisma entities and domain types.
 * Follows SOLID principles: Single Responsibility for mapping logic.
 */
import type { WorkoutSession } from '@onecoach/types';
import type { workout_sessions } from '@prisma/client';
/**
 * Maps Prisma workout_sessions entity to domain WorkoutSession
 *
 * @param prismaSession - Raw Prisma session entity
 * @returns Properly typed WorkoutSession domain object
 */
export declare function mapToWorkoutSession(prismaSession: workout_sessions): WorkoutSession;
/**
 * Maps array of Prisma sessions to domain WorkoutSessions
 *
 * @param prismaSessions - Array of raw Prisma session entities
 * @returns Array of properly typed WorkoutSession domain objects
 */
export declare function mapToWorkoutSessions(prismaSessions: workout_sessions[]): WorkoutSession[];
