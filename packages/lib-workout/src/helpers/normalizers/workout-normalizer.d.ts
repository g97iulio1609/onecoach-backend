/**
 * Workout Normalizer
 *
 * Funzioni per normalizzare dati workout programs da formati vari
 */
import { DifficultyLevel, WorkoutStatus } from '@onecoach/types/client';
import type { workout_programs as PrismaWorkoutProgram, workout_program_versions as PrismaWorkoutProgramVersion } from '@prisma/client';
import type { WorkoutDay, WorkoutProgram, WorkoutWeek } from '@onecoach/types';
type RawJson = Record<string, unknown>;
/**
 * Normalizza il livello di difficoltà
 */
export declare function normalizeDifficulty(value: unknown): DifficultyLevel;
/**
 * Normalizza lo status del workout
 */
export declare function normalizeStatus(value: unknown): WorkoutStatus;
/**
 * Normalizza un giorno di allenamento
 */
export declare function normalizeDay(rawDay: unknown, index: number): WorkoutDay;
/**
 * Normalizza una settimana di allenamento
 */
export declare function normalizeWeek(rawWeek: unknown, index: number): WorkoutWeek;
/**
 * Parse le settimane da un valore sconosciuto
 */
export declare function parseWeeks(value: unknown): RawJson[];
/**
 * Normalizza metadata
 */
export declare function normalizeMetadata(value: unknown): Record<string, unknown> | null;
/**
 * Normalizza un workout program completo da Prisma
 */
export declare function normalizeWorkoutProgram(program: PrismaWorkoutProgram | PrismaWorkoutProgramVersion): WorkoutProgram;
export {};
