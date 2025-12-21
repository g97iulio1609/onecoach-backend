/**
 * Progression Calculator
 *
 * Utility per calcolare progressioni nei gruppi di serie
 */
import type { ExerciseSet, SetProgression, SetGroup } from '@onecoach/types';
/**
 * Applica una progressione a una serie base in base al numero della serie
 */
export declare function applyProgression(baseSet: ExerciseSet, progression: SetProgression, setNumber: number): ExerciseSet;
/**
 * Genera tutte le serie da un gruppo applicando la progressione se presente
 */
export declare function generateSetsFromGroup(group: SetGroup): ExerciseSet[];
/**
 * Calcola una stringa riassuntiva per un gruppo (per badge compatta)
 * Es. "5x10 @ 70% 1RM" o "5x10-12 @ 70-75% 1RM"
 */
export declare function calculateGroupSummary(group: SetGroup): string;
/**
 * Verifica se un gruppo ha tutti i parametri identici (nessuna progressione effettiva)
 */
export declare function isUniformGroup(group: SetGroup): boolean;
