/**
 * Granular Session Service
 *
 * Service for granular manipulation of workout sessions and set groups.
 * Provides fine-grained control over every field of each session.
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles granular session modifications
 * - Open/Closed: Extensible through composition
 * - Dependency Inversion: Uses interfaces for external dependencies
 *
 * DRY: Uses centralized utilities from helpers/utils
 *
 * @module lib-workout/services/granular-session.service
 */
import type { WorkoutProgram, SetGroup } from '@onecoach/types';
/**
 * Target identifier for a specific location in the program
 */
export interface SessionTarget {
    weekNumber: number;
    dayNumber: number;
    exerciseIndex: number;
    setGroupIndex?: number;
    setIndex?: number;
}
/**
 * Granular update payload for ExerciseSet fields
 */
export interface SetFieldUpdate {
    reps?: number;
    repsMax?: number;
    duration?: number;
    weight?: number;
    weightMax?: number;
    weightLbs?: number;
    intensityPercent?: number;
    intensityPercentMax?: number;
    rpe?: number;
    rpeMax?: number;
    rest?: number;
}
/**
 * Granular update payload for SetGroup fields
 */
export interface SetGroupUpdate extends SetFieldUpdate {
    count?: number;
}
/**
 * Granular update payload for Exercise level
 */
export interface ExerciseUpdate {
    name?: string;
    description?: string;
    notes?: string;
    typeLabel?: string;
    repRange?: string;
    formCues?: string[];
    equipment?: string[];
    videoUrl?: string;
}
/**
 * Granular update payload for Day level
 */
export interface DayUpdate {
    name?: string;
    notes?: string;
    warmup?: string;
    cooldown?: string;
    totalDuration?: number;
    targetMuscles?: string[];
}
/**
 * Granular update payload for Week level
 */
export interface WeekUpdate {
    focus?: string;
    notes?: string;
}
/**
 * Batch update operation
 */
export interface BatchUpdateOperation {
    target: SessionTarget;
    setGroupUpdate?: SetGroupUpdate;
    exerciseUpdate?: ExerciseUpdate;
    dayUpdate?: DayUpdate;
    weekUpdate?: WeekUpdate;
}
/**
 * Result of a granular operation
 */
export interface GranularOperationResult {
    success: boolean;
    program?: WorkoutProgram;
    error?: string;
    modifiedTargets?: SessionTarget[];
}
export declare class GranularSessionService {
    /**
     * Update a specific SetGroup with granular field changes
     * Handles automatic conversions (kg <-> lbs, weight <-> intensity)
     */
    static updateSetGroup(program: WorkoutProgram, target: SessionTarget, update: SetGroupUpdate, oneRepMax?: number): GranularOperationResult;
    /**
     * Update a specific set within a SetGroup (for individual set customization)
     */
    static updateIndividualSet(program: WorkoutProgram, target: SessionTarget, update: SetFieldUpdate, oneRepMax?: number): GranularOperationResult;
    /**
     * Update exercise-level fields
     */
    static updateExercise(program: WorkoutProgram, target: SessionTarget, update: ExerciseUpdate): GranularOperationResult;
    /**
     * Update day-level fields
     */
    static updateDay(program: WorkoutProgram, weekNumber: number, dayNumber: number, update: DayUpdate): GranularOperationResult;
    /**
     * Update week-level fields
     */
    static updateWeek(program: WorkoutProgram, weekNumber: number, update: WeekUpdate): GranularOperationResult;
    /**
     * Batch update multiple targets in a single operation
     */
    static batchUpdate(program: WorkoutProgram, operations: BatchUpdateOperation[], oneRepMax?: number): GranularOperationResult;
    /**
     * Add a new SetGroup to an exercise
     */
    static addSetGroup(program: WorkoutProgram, target: SessionTarget, setGroup: Partial<SetGroup>): GranularOperationResult;
    /**
     * Remove a SetGroup from an exercise
     */
    static removeSetGroup(program: WorkoutProgram, target: SessionTarget): GranularOperationResult;
    /**
     * Duplicate a SetGroup within the same exercise
     */
    static duplicateSetGroup(program: WorkoutProgram, target: SessionTarget): GranularOperationResult;
    /**
     * Copy progression pattern from one exercise to another
     */
    static copyProgressionPattern(program: WorkoutProgram, sourceExerciseName: string, targetExerciseName: string): GranularOperationResult;
    /**
     * Resize a SetGroup to a new count
     */
    private static resizeSetGroup;
    /**
     * Process set field updates with automatic conversions
     */
    private static processSetFieldUpdates;
}
export default GranularSessionService;
//# sourceMappingURL=granular-session.service.d.ts.map