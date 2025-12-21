/**
 * Workout Operations
 *
 * Funzioni pure per operazioni CRUD su workout programs
 * Segue il pattern di lib/nutrition/plan-operations.ts
 */
import type { WorkoutProgram, WorkoutWeek, WorkoutDay, Exercise, ExerciseSet } from '@onecoach/types';
/**
 * Aggiunge una nuova settimana al programma
 */
export declare function addWorkoutWeek(program: WorkoutProgram): {
    program: WorkoutProgram;
    weekNumber: number;
};
/**
 * Rimuove una settimana dal programma e riindicizza le settimane rimanenti
 */
export declare function removeWeek(program: WorkoutProgram, weekNumber: number): WorkoutProgram;
/**
 * Aggiunge un nuovo giorno alla settimana specificata
 */
export declare function addDay(program: WorkoutProgram, weekNumber: number): {
    program: WorkoutProgram;
    weekNumber: number;
    dayNumber: number;
};
/**
 * Rimuove un giorno dalla settimana specificata e riindicizza i giorni rimanenti
 */
export declare function removeDay(program: WorkoutProgram, weekNumber: number, dayNumber: number): WorkoutProgram;
/**
 * Aggiunge un esercizio al giorno specificato
 */
export declare function addExercise(program: WorkoutProgram, weekNumber: number, dayNumber: number, exercise?: Exercise): WorkoutProgram;
/**
 * Rimuove un esercizio dal giorno specificato
 */
export declare function removeExercise(program: WorkoutProgram, weekNumber: number, dayNumber: number, exerciseId: string): WorkoutProgram;
/**
 * Aggiorna un esercizio esistente
 */
export declare function updateExercise(program: WorkoutProgram, weekNumber: number, dayNumber: number, exerciseId: string, updates: Partial<Exercise>): WorkoutProgram;
/**
 * Aggiorna un giorno esistente
 */
export declare function updateDay(program: WorkoutProgram, weekNumber: number, dayNumber: number, updates: Partial<WorkoutDay>): WorkoutProgram;
/**
 * Aggiorna una settimana esistente
 */
export declare function updateWeek(program: WorkoutProgram, weekNumber: number, updates: Partial<WorkoutWeek>): WorkoutProgram;
/**
 * Aggiunge un nuovo gruppo di serie a un esercizio nel programma
 * (Operation: modifica il programma)
 */
export declare function addSetGroupToExercise(program: WorkoutProgram, weekNumber: number, dayNumber: number, exerciseId: string, baseSet: ExerciseSet, count: number): WorkoutProgram;
/**
 * Alias ergonomico per creare e aggiungere un nuovo SetGroup a un esercizio.
 */
export declare function createSetGroup(program: WorkoutProgram, weekNumber: number, dayNumber: number, exerciseId: string, baseSet: ExerciseSet, count: number): WorkoutProgram;
/**
 * Raggruppa serie selezionate in un gruppo
 * SSOT: Usa setGroups per accedere alle serie, non exercise.sets legacy
 */
export declare function groupSelectedSets(program: WorkoutProgram, weekNumber: number, dayNumber: number, exerciseId: string, setIndices: number[]): WorkoutProgram;
/**
 * Separa un gruppo di serie tornando le serie individuali
 */
export declare function splitSetGroup(program: WorkoutProgram, weekNumber: number, dayNumber: number, exerciseId: string, groupId: string): WorkoutProgram;
/**
 * Rimuove un gruppo di serie
 */
export declare function removeSetGroup(program: WorkoutProgram, weekNumber: number, dayNumber: number, exerciseId: string, groupId: string): WorkoutProgram;
/**
 * Duplica un gruppo di serie
 */
export declare function duplicateSetGroup(program: WorkoutProgram, weekNumber: number, dayNumber: number, exerciseId: string, groupId: string): WorkoutProgram;
