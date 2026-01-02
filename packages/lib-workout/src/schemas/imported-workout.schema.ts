/**
 * Imported Workout Schema
 *
 * Types and schemas for workout import feature.
 * Re-exports shared types from lib-import-core and adds workout-specific types.
 *
 * @module lib-workout/schemas/imported-workout
 */

// Re-export shared types from lib-import-core
export type { ImportFile, ImportOptions, ImportProgress, AIParseContext } from '@onecoach/lib-import-core';
export { IMPORT_LIMITS, SUPPORTED_MIME_TYPES, ImportFileSchema, ImportOptionsSchema } from '@onecoach/lib-import-core';

/**
 * Imported exercise from AI parsing
 */
export interface ImportedExercise {
  name: string;
  sets?: number;
  reps?: string;
  weight?: string;
  rest?: string;
  notes?: string;
  tempo?: string;
  rpe?: number;
  rir?: number;
  intensity?: number;
  supersetGroup?: string;
  exerciseId?: string; // Matched exercise ID
  confidence?: number; // Match confidence 0-1
}

/**
 * Imported workout day from AI parsing
 */
export interface ImportedDay {
  name: string;
  dayNumber?: number;
  exercises: ImportedExercise[];
  notes?: string;
  focus?: string;
}

/**
 * Imported workout week from AI parsing  
 */
export interface ImportedWeek {
  name?: string;
  weekNumber: number;
  days: ImportedDay[];
  notes?: string;
}

/**
 * Complete imported workout program from AI parsing
 */
export interface ImportedWorkoutProgram {
  name: string;
  description?: string;
  weeks: ImportedWeek[];
  metadata?: {
    source?: string;
    author?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    duration?: string;
    frequency?: string;
    equipment?: string[];
    goals?: string[];
  };
}
