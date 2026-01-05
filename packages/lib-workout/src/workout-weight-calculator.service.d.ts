/**
 * Workout Weight Calculator Service
 *
 * Servizio per calcolare e aggiornare i pesi nei programmi di allenamento
 * basandosi sugli 1RM dell'utente e le percentuali di intensità
 */
import type { WorkoutProgram, ExerciseSet } from '@onecoach/types';
/**
 * Calculate weights for a single set based on 1RM
 * Extracted common logic for reuse (DRY principle)
 * @param set - Exercise set to calculate weights for
 * @param oneRepMaxKg - User's 1RM for the exercise in kg
 * @param weightIncrement - Plate increment for rounding (default 2.5)
 * @returns Updated set with calculated weight, weightLbs, and intensityPercent
 */
export declare function calculateSetWeights(set: ExerciseSet, oneRepMaxKg: number, weightIncrement?: number): ExerciseSet;
/**
 * Calcola i pesi in un programma basandosi sugli 1RM dell'utente
 * @param userId - ID dell'utente
 * @param program - Programma di allenamento
 * @returns Programma con pesi calcolati
 */
export declare function calculateWeightsInProgram(userId: string, program: WorkoutProgram): Promise<WorkoutProgram>;
/**
 * Aggiorna tutti i programmi attivi dell'utente quando viene inserito/aggiornato un 1RM
 * @param userId - ID dell'utente
 * @param catalogExerciseId - ID dell'esercizio nel catalogo per cui è stato inserito/aggiornato l'1RM
 */
export declare function updateProgramWeightsForExerciseId(userId: string, catalogExerciseId: string): Promise<void>;
//# sourceMappingURL=workout-weight-calculator.service.d.ts.map