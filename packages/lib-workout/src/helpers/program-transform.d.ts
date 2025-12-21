import type { Exercise, WorkoutDay, WorkoutProgram, WorkoutWeek, ExerciseSet } from '@onecoach/types';
export declare function createEmptyExercise(): Exercise;
export declare function createEmptyDay(_weekNumber: number, dayNumber: number): WorkoutDay;
export declare function createEmptyWeek(weekNumber: number): WorkoutWeek;
/**
 * Appiattisce i gruppi di serie in serie individuali
 * SSOT: Usa setGroups come fonte principale per le serie
 */
export declare function flattenSetGroups(exercise: Exercise): ExerciseSet[];
/**
 * Ricostruisce i gruppi di serie quando possibile al caricamento
 * Nota: per ora non implementiamo logica automatica di raggruppamento,
 * manteniamo solo setGroups se già presenti. In futuro si potrebbe
 * implementare euristica per raggruppare serie identiche.
 */
export declare function reconstructSetGroups(exercise: Exercise): Exercise;
export declare function createEmptyProgram(): WorkoutProgram;
export declare function prepareProgramForPersistence(program: WorkoutProgram): {
    name: string;
    description: string;
    difficulty: import("@prisma/client").$Enums.DifficultyLevel;
    durationWeeks: number;
    goals: string[];
    status: import("@prisma/client").$Enums.WorkoutStatus;
    weeks: {
        weekNumber: number;
        notes: string | undefined;
        focus: string | undefined;
        days: {
            dayNumber: number;
            name: string;
            notes: string;
            totalDuration: number | undefined;
            targetMuscles: string[];
            warmup: string | undefined;
            cooldown: string;
            exercises: {
                id: string;
                name: string;
                description: string;
                category: import("@onecoach/types").ExerciseCategory;
                muscleGroups: import("@onecoach/types").MuscleGroup[];
                notes: string;
                type: string;
                repRange: string;
                formCues: string[];
                equipment: string[];
                sets: {
                    reps: number | null;
                    duration: number | null;
                    weight: number | null;
                    weightLbs: number | null;
                    rest: number;
                    intensityPercent: number | null;
                    rpe: number | null;
                }[];
                setGroups: {
                    id: string;
                    count: number;
                    baseSet: {
                        reps: number | null;
                        duration: number | null;
                        weight: number | null;
                        weightLbs: number | null;
                        rest: number;
                        intensityPercent: number | null;
                        rpe: number | null;
                    };
                    progression: import("@onecoach/types").SetProgression | null;
                    sets: {
                        reps: number | null;
                        duration: number | null;
                        weight: number | null;
                        weightLbs: number | null;
                        rest: number;
                        intensityPercent: number | null;
                        rpe: number | null;
                    }[];
                }[] | null;
                exerciseId: string;
            }[];
        }[];
    }[];
    metadata: Record<string, unknown>;
};
/**
 * Normalize workout payload structure (synchronous version, no ID conversion)
 * Used in frontend where we don't need to convert goal names to IDs
 * The backend will handle the ID conversion when saving
 */
export declare function normalizeAgentWorkoutPayloadSync(payload: unknown, base?: Partial<WorkoutProgram>): WorkoutProgram;
