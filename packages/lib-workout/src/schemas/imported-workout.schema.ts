/**
 * Imported Workout Schema
 *
 * Re-exports from @onecoach/schemas which is the SSOT for these types.
 * This file exists only for backwards compatibility with existing imports.
 *
 * @module lib-workout/schemas/imported-workout
 * @deprecated Import directly from @onecoach/schemas instead
 */

// Re-export all imported workout types from SSOT
export {
  ImportedSetSchema,
  type ImportedSet,
  ImportedExerciseSchema,
  type ImportedExercise,
  ImportedDaySchema,
  type ImportedDay,
  ImportedWeekSchema,
  type ImportedWeek,
  ImportedWorkoutProgramSchema,
  type ImportedWorkoutProgram,
  ParseResultSchema,
  type ParseResult,
  ImportOptionsSchema,
  type ImportOptions,
  ImportFileSchema,
  type ImportFile,
  ImportRequestSchema,
  type ImportRequest,
  SUPPORTED_MIME_TYPES,
  type SupportedMimeType,
  SUPPORTED_EXTENSIONS,
  type SupportedExtension,
  IMPORT_LIMITS,
} from '@onecoach/schemas';
