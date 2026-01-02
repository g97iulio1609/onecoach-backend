/**
 * Imported Workout Schema
 *
 * Types and schemas for workout import feature.
 * Re-exports shared types from lib-import-core and adds workout-specific types.
 *
 * @module lib-workout/schemas/imported-workout
 */

import { z } from 'zod';

// Re-export shared types from lib-import-core
export type { ImportFile, ImportOptions, ImportProgress, AIParseContext } from '@onecoach/lib-import-core';
export { IMPORT_LIMITS, SUPPORTED_MIME_TYPES, ImportFileSchema, ImportOptionsSchema } from '@onecoach/lib-import-core';

/**
 * Zod schema for imported exercise
 */
export const ImportedExerciseSchema = z.object({
  name: z.string(),
  sets: z.number().optional(),
  reps: z.string().optional(),
  weight: z.string().optional(),
  rest: z.string().optional(),
  notes: z.string().optional(),
  tempo: z.string().optional(),
  rpe: z.number().optional(),
  rir: z.number().optional(),
  intensity: z.number().optional(),
  supersetGroup: z.string().optional(),
  exerciseId: z.string().optional(),
  confidence: z.number().optional(),
});

/**
 * Zod schema for imported day
 */
export const ImportedDaySchema = z.object({
  name: z.string(),
  dayNumber: z.number().optional(),
  exercises: z.array(ImportedExerciseSchema),
  notes: z.string().optional(),
  focus: z.string().optional(),
});

/**
 * Zod schema for imported week
 */
export const ImportedWeekSchema = z.object({
  name: z.string().optional(),
  weekNumber: z.number(),
  days: z.array(ImportedDaySchema),
  notes: z.string().optional(),
});

/**
 * Zod schema for complete imported workout program
 */
export const ImportedWorkoutProgramSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  weeks: z.array(ImportedWeekSchema),
  metadata: z.object({
    source: z.string().optional(),
    author: z.string().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    duration: z.string().optional(),
    frequency: z.string().optional(),
    equipment: z.array(z.string()).optional(),
    goals: z.array(z.string()).optional(),
  }).optional(),
});
/**
 * Type inferences from zod schemas
 */
export type ImportedExercise = z.infer<typeof ImportedExerciseSchema>;
export type ImportedDay = z.infer<typeof ImportedDaySchema>;
export type ImportedWeek = z.infer<typeof ImportedWeekSchema>;
export type ImportedWorkoutProgram = z.infer<typeof ImportedWorkoutProgramSchema>;
