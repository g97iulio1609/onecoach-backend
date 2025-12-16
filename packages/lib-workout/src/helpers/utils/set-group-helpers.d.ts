/**
 * SetGroup Helpers
 *
 * SSOT utilities per manipolazione SetGroup.
 * Usare SEMPRE questi helper invece di accedere direttamente a exercise.sets.
 *
 * Principi SOLID:
 * - Single Responsibility: ogni funzione fa una cosa sola
 * - Open/Closed: estendibile senza modificare
 * - DRY: logica centralizzata qui
 */
import type { SetGroup, ExerciseSet, SetProgression } from '@onecoach/schemas';
import type { Exercise } from '@onecoach/types';
/**
 * Genera un ID univoco per SetGroup
 */
export declare function generateSetGroupId(): string;
/**
 * Calcola le serie espanse da baseSet + count + progression opzionale.
 * Questa è la funzione core per idratare SetGroup.sets[].
 *
 * @param baseSet - Parametri base per tutte le serie
 * @param count - Numero di serie da generare
 * @param progression - Progressione opzionale tra serie
 * @returns Array di ExerciseSet espansi
 *
 * @example
 * // 4 serie identiche
 * const sets = expandSetsFromGroup(baseSet, 4);
 *
 * // 4 serie con progressione lineare +2.5kg
 * const setsWithProgression = expandSetsFromGroup(baseSet, 4, {
 *   type: 'linear',
 *   steps: [{ fromSet: 1, toSet: 4, adjustment: 2.5 }]
 * });
 */
export declare function expandSetsFromGroup(baseSet: ExerciseSet, count: number, progression?: SetProgression): ExerciseSet[];
/**
 * Idrata tutti i SetGroup di un esercizio, popolando sets[] da baseSet + count.
 * Utile quando si caricano esercizi dal DB che hanno solo baseSet/count.
 *
 * @param setGroups - Array di SetGroup da idratare
 * @returns SetGroup[] con sets[] popolati
 */
export declare function hydrateSetGroups(setGroups: SetGroup[]): SetGroup[];
/**
 * Estrae tutte le serie espanse da un array di SetGroup.
 * Utile per calcoli di volume, analytics, ecc.
 *
 * @param setGroups - Array di SetGroup
 * @returns Array flat di ExerciseSet
 *
 * @example
 * const allSets = getExpandedSets(exercise.setGroups);
 * const totalVolume = allSets.reduce((sum: any, set: any) => sum + (set.reps * set.weight), 0);
 */
export declare function getExpandedSets(setGroups: SetGroup[]): ExerciseSet[];
/**
 * Estrae tutte le serie da un esercizio.
 * USARE QUESTO invece di accedere a exercise.sets.
 *
 * @param exercise - Esercizio da cui estrarre le serie
 * @returns Array di ExerciseSet
 */
export declare function getExerciseSets(exercise: Exercise): ExerciseSet[];
/**
 * Crea un SetGroup da parametri semplici.
 * Utile per il Visual Builder quando si aggiunge un nuovo gruppo di serie.
 *
 * @param count - Numero di serie
 * @param baseSetParams - Parametri per la serie base
 * @returns SetGroup completo con sets[] espansi
 */
export declare function createSetGroupFromParams(count: number, baseSetParams: Partial<ExerciseSet> & {
    rest: number;
}): SetGroup;
/**
 * Aggiunge una progressione a un SetGroup esistente e rigenera sets[].
 *
 * @param setGroup - SetGroup esistente
 * @param progression - Progressione da applicare
 * @returns Nuovo SetGroup con progressione e sets[] aggiornati
 */
export declare function addProgressionToSetGroup(setGroup: SetGroup, progression: SetProgression): SetGroup;
/**
 * Calcola il volume totale di un SetGroup.
 * Volume = Σ(reps × weight) per ogni serie.
 */
export declare function calculateSetGroupVolume(setGroup: SetGroup): number;
/**
 * Calcola il volume totale di un esercizio.
 */
export declare function calculateExerciseVolume(exercise: Exercise): number;
/**
 * Conta il numero totale di serie di un esercizio.
 */
export declare function countExerciseSets(exercise: Exercise): number;
/**
 * Valida che un SetGroup sia valido.
 */
export declare function isValidSetGroup(setGroup: unknown): setGroup is SetGroup;
/**
 * Valida che un esercizio abbia setGroups validi.
 */
export declare function hasValidSetGroups(exercise: unknown): boolean;
//# sourceMappingURL=set-group-helpers.d.ts.map