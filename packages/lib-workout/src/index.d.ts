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
export * from './schemas/imported-workout.schema';
export * from './services/file-validator.service';
export * from './services/file-parser.service';
export * from './services/exercise-matcher.service';
export * from './services/workout-import.service';
export * from './services/workout-vision.service';
export * from './services/workout-statistics.service';
export * from './services/workout-progression.service';
export * from './services/progression-template.service';
export * from './services/granular-session.service';
export type { ImportProgress } from '@onecoach/lib-import-core';
export { WorkoutImportService, type WorkoutImportResult, type WorkoutImportResult as ImportResult } from './services/workout-import.service';
