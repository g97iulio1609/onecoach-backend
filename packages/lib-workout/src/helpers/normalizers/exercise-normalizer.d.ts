/**
 * Exercise Normalizer
 *
 * Funzioni per normalizzare dati esercizi da formati vari (JSON, AI, etc.)
 */
import type { Exercise, ExerciseSet, SetGroup, SetProgression } from '@onecoach/types';
/**
 * Normalizza i gruppi muscolari da un valore sconosciuto
 */
export declare function normalizeMuscleGroups(value: unknown): Exercise['muscleGroups'];
/**
 * Normalizza una categoria esercizio
 */
export declare function normalizeCategory(value: unknown): Exercise['category'];
/**
 * Normalizza i set di un esercizio
 */
export declare function normalizeExerciseSets(value: unknown): ExerciseSet[];
/**
 * Normalizza una progressione di serie
 */
export declare function normalizeSetProgression(raw: unknown): SetProgression | undefined;
/**
 * Normalizza un gruppo di serie
 */
export declare function normalizeSetGroup(raw: unknown): SetGroup | null;
/**
 * Normalizza un esercizio completo
 * Se exerciseId è presente, viene preservato per risoluzione futura nel frontend
 */
export declare function normalizeExercise(rawExercise: unknown, dayNumber: number, index: number): Exercise;
