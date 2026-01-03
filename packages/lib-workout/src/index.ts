/**
 * @onecoach/lib-workout
 *
 * Servizi per il dominio workout
 * Implementa contratti da @onecoach/contracts
 */

export * from './workout.service';
export * from './helpers';
export * from './workout-weight-calculator.service';
export * from './workout-normalization.service';
export * from './mappers/workout-session.mapper';

// Workout Import Feature
export * from './services/file-validator.service';
export * from './services/file-parser.service';
export * from './services/exercise-matcher.service';
export * from './services/workout-import.service';
export * from './services/workout-statistics.service';
export * from './services/workout-progression.service';
export * from './services/progression-template.service';
export * from './services/granular-session.service';
export * from './services/workout-vision.service';

// Schemas
export * from './schemas/imported-workout.schema';

export type { ImportProgress, AIParseContext } from '@onecoach/lib-import-core';
export { SUPPORTED_MIME_TYPES, IMPORT_LIMITS, ImportFileSchema, ImportOptionsSchema } from '@onecoach/lib-import-core';

// Type-safe AIParseContext for workout domain
import type { AIParseContext as GenericAIParseContext } from '@onecoach/lib-import-core';
import type { ImportedWorkoutProgram } from './schemas/imported-workout.schema';
export type WorkoutAIParseContext = GenericAIParseContext<ImportedWorkoutProgram>;
export { WorkoutImportService, type WorkoutImportResult, type WorkoutImportResult as ImportResult } from './services/workout-import.service';

