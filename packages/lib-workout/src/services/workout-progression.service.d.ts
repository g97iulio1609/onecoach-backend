import type { WorkoutProgram, Exercise, SetGroup } from '@onecoach/types';
export type ProgressionType = 'linear_weight' | 'linear_reps' | 'linear_sets' | 'percentage' | 'rpe';
export interface ProgressionParams {
    type: ProgressionType;
    startValue: number;
    increment: number;
    frequency: number;
    targetSetIndex?: number;
}
export interface ExerciseOccurrence {
    weekIndex: number;
    dayIndex: number;
    exerciseIndex: number;
    weekNumber: number;
    dayNumber: number;
    dayName: string;
    exercise: Exercise;
    programId: string;
}
export interface GroupedExercise {
    exerciseId: string;
    name: string;
    occurrences: ExerciseOccurrence[];
}
export declare class WorkoutProgressionService {
    /**
     * Raggruppa tutti gli esercizi del programma per identificarne le occorrenze
     */
    static groupExercises(program: WorkoutProgram): GroupedExercise[];
    /**
     * Ridimensiona un gruppo di serie (SetGroup)
     * Aggiunge o rimuove serie mantenendo i dati esistenti
     */
    static resizeSetGroup(group: SetGroup, newCount: number): void;
    /**
     * Sincronizza i valori di un'occorrenza con un nuovo 1RM
     * Se c'è intensity, ricalcola weight. Se c'è weight, ricalcola intensity.
     */
    static syncOccurrenceWithOneRepMax(occ: ExerciseOccurrence, oneRepMax: number): ExerciseOccurrence;
    /**
     * Calcola l'anteprima della progressione senza modificare il programma originale
     * Restituisce le occorrenze con i valori aggiornati
     */
    static previewProgression(occurrences: ExerciseOccurrence[], params: ProgressionParams, selectedIndices: number[], oneRepMax?: number): ExerciseOccurrence[];
    private static updateSet;
    /**
     * Applica le modifiche al programma completo
     */
    static applyToProgram(program: WorkoutProgram, updates: ExerciseOccurrence[]): WorkoutProgram;
}
//# sourceMappingURL=workout-progression.service.d.ts.map