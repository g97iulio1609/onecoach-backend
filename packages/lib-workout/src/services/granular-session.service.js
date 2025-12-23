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
import { calculateWeightFromIntensity, calculateIntensityFromWeight, kgToLbs, lbsToKg, } from '../helpers/intensity-calculator';
import { generateSetsFromGroup } from '../helpers/utils/progression-calculator';
import { deepClone } from '../helpers/utils';
import {  createId  } from '@onecoach/lib-shared/id-generator';
// =====================================================
// Utility Functions
// =====================================================
/**
 * Validates a session target against a program
 */
function validateTarget(program, target) {
    const week = program.weeks.find((w) => w.weekNumber === target.weekNumber);
    if (!week)
        return `Week ${target.weekNumber} not found`;
    const day = week.days.find((d) => d.dayNumber === target.dayNumber);
    if (!day)
        return `Day ${target.dayNumber} not found in week ${target.weekNumber}`;
    const exercise = day.exercises[target.exerciseIndex];
    if (!exercise)
        return `Exercise at index ${target.exerciseIndex} not found`;
    if (target.setGroupIndex !== undefined) {
        const setGroup = exercise.setGroups[target.setGroupIndex];
        if (!setGroup)
            return `SetGroup at index ${target.setGroupIndex} not found`;
        if (target.setIndex !== undefined) {
            if (target.setIndex < 0 || target.setIndex >= setGroup.sets.length) {
                return `Set at index ${target.setIndex} not found in setGroup`;
            }
        }
    }
    return null; // Valid
}
/**
 * Gets the exercise at a target location
 */
function getExerciseAtTarget(program, target) {
    const week = program.weeks.find((w) => w.weekNumber === target.weekNumber);
    if (!week)
        return null;
    const day = week.days.find((d) => d.dayNumber === target.dayNumber);
    if (!day)
        return null;
    return day.exercises[target.exerciseIndex] || null;
}
// =====================================================
// Core Service Class
// =====================================================
export class GranularSessionService {
    /**
     * Update a specific SetGroup with granular field changes
     * Handles automatic conversions (kg <-> lbs, weight <-> intensity)
     */
    static updateSetGroup(program, target, update, oneRepMax) {
        // Validate target
        const error = validateTarget(program, target);
        if (error)
            return { success: false, error };
        // Deep clone to ensure immutability
        const newProgram = deepClone(program);
        // Navigate to target
        const weekIdx = newProgram.weeks.findIndex((w) => w.weekNumber === target.weekNumber);
        const dayIdx = newProgram.weeks[weekIdx].days.findIndex((d) => d.dayNumber === target.dayNumber);
        const exercise = newProgram.weeks[weekIdx].days[dayIdx].exercises[target.exerciseIndex];
        const setGroupIdx = target.setGroupIndex ?? 0;
        const setGroup = exercise.setGroups[setGroupIdx];
        if (!setGroup) {
            return { success: false, error: 'SetGroup not found' };
        }
        // Handle count change (resize set group)
        if (update.count !== undefined && update.count !== setGroup.count) {
            this.resizeSetGroup(setGroup, update.count);
        }
        // Extract set field updates
        const { count: _, ...setFieldUpdates } = update;
        // Apply updates to baseSet and calculate conversions
        if (Object.keys(setFieldUpdates).length > 0) {
            const processedUpdates = this.processSetFieldUpdates(setFieldUpdates, setGroup.baseSet, oneRepMax);
            // Update baseSet
            setGroup.baseSet = { ...setGroup.baseSet, ...processedUpdates };
            // Update all sets in the group
            setGroup.sets = setGroup.sets.map((set) => ({
                ...set,
                ...processedUpdates,
            }));
        }
        return {
            success: true,
            program: newProgram,
            modifiedTargets: [target],
        };
    }
    /**
     * Update a specific set within a SetGroup (for individual set customization)
     */
    static updateIndividualSet(program, target, update, oneRepMax) {
        if (target.setGroupIndex === undefined || target.setIndex === undefined) {
            return {
                success: false,
                error: 'setGroupIndex and setIndex are required for individual set updates',
            };
        }
        const error = validateTarget(program, target);
        if (error)
            return { success: false, error };
        const newProgram = deepClone(program);
        const weekIdx = newProgram.weeks.findIndex((w) => w.weekNumber === target.weekNumber);
        const dayIdx = newProgram.weeks[weekIdx].days.findIndex((d) => d.dayNumber === target.dayNumber);
        const exercise = newProgram.weeks[weekIdx].days[dayIdx].exercises[target.exerciseIndex];
        const setGroup = exercise.setGroups[target.setGroupIndex];
        const set = setGroup.sets[target.setIndex];
        if (!set) {
            return { success: false, error: 'Set not found' };
        }
        const processedUpdates = this.processSetFieldUpdates(update, set, oneRepMax);
        setGroup.sets[target.setIndex] = { ...set, ...processedUpdates };
        return {
            success: true,
            program: newProgram,
            modifiedTargets: [target],
        };
    }
    /**
     * Update exercise-level fields
     */
    static updateExercise(program, target, update) {
        const error = validateTarget(program, target);
        if (error)
            return { success: false, error };
        const newProgram = deepClone(program);
        const weekIdx = newProgram.weeks.findIndex((w) => w.weekNumber === target.weekNumber);
        const dayIdx = newProgram.weeks[weekIdx].days.findIndex((d) => d.dayNumber === target.dayNumber);
        const exercise = newProgram.weeks[weekIdx].days[dayIdx].exercises[target.exerciseIndex];
        if (!exercise) {
            return { success: false, error: 'Exercise not found' };
        }
        // Apply updates
        Object.assign(exercise, update);
        return {
            success: true,
            program: newProgram,
            modifiedTargets: [target],
        };
    }
    /**
     * Update day-level fields
     */
    static updateDay(program, weekNumber, dayNumber, update) {
        const newProgram = deepClone(program);
        const weekIdx = newProgram.weeks.findIndex((w) => w.weekNumber === weekNumber);
        if (weekIdx === -1) {
            return { success: false, error: `Week ${weekNumber} not found` };
        }
        const dayIdx = newProgram.weeks[weekIdx].days.findIndex((d) => d.dayNumber === dayNumber);
        if (dayIdx === -1) {
            return { success: false, error: `Day ${dayNumber} not found` };
        }
        const day = newProgram.weeks[weekIdx].days[dayIdx];
        Object.assign(day, update);
        return {
            success: true,
            program: newProgram,
        };
    }
    /**
     * Update week-level fields
     */
    static updateWeek(program, weekNumber, update) {
        const newProgram = deepClone(program);
        const weekIdx = newProgram.weeks.findIndex((w) => w.weekNumber === weekNumber);
        if (weekIdx === -1) {
            return { success: false, error: `Week ${weekNumber} not found` };
        }
        const week = newProgram.weeks[weekIdx];
        Object.assign(week, update);
        return {
            success: true,
            program: newProgram,
        };
    }
    /**
     * Batch update multiple targets in a single operation
     */
    static batchUpdate(program, operations, oneRepMax) {
        let currentProgram = deepClone(program);
        const modifiedTargets = [];
        for (const op of operations) {
            let result;
            if (op.setGroupUpdate) {
                result = this.updateSetGroup(currentProgram, op.target, op.setGroupUpdate, oneRepMax);
            }
            else if (op.exerciseUpdate) {
                result = this.updateExercise(currentProgram, op.target, op.exerciseUpdate);
            }
            else if (op.dayUpdate) {
                result = this.updateDay(currentProgram, op.target.weekNumber, op.target.dayNumber, op.dayUpdate);
            }
            else if (op.weekUpdate) {
                result = this.updateWeek(currentProgram, op.target.weekNumber, op.weekUpdate);
            }
            else {
                continue;
            }
            if (!result.success) {
                return {
                    success: false,
                    error: `Batch operation failed at target (W${op.target.weekNumber} D${op.target.dayNumber} E${op.target.exerciseIndex}): ${result.error}`,
                };
            }
            currentProgram = result.program;
            modifiedTargets.push(op.target);
        }
        return {
            success: true,
            program: currentProgram,
            modifiedTargets,
        };
    }
    /**
     * Add a new SetGroup to an exercise
     */
    static addSetGroup(program, target, setGroup) {
        const newProgram = deepClone(program);
        const weekIdx = newProgram.weeks.findIndex((w) => w.weekNumber === target.weekNumber);
        if (weekIdx === -1)
            return { success: false, error: 'Week not found' };
        const dayIdx = newProgram.weeks[weekIdx].days.findIndex((d) => d.dayNumber === target.dayNumber);
        if (dayIdx === -1)
            return { success: false, error: 'Day not found' };
        const exercise = newProgram.weeks[weekIdx].days[dayIdx].exercises[target.exerciseIndex];
        if (!exercise)
            return { success: false, error: 'Exercise not found' };
        // Create default setGroup if not provided
        const newSetGroup = {
            id: setGroup.id || createId(),
            count: setGroup.count || 3,
            baseSet: setGroup.baseSet || {
                reps: 10,
                weight: null,
                weightLbs: null,
                rest: 90,
                intensityPercent: null,
                rpe: null,
            },
            sets: setGroup.sets || [],
        };
        // Generate sets if not provided
        if (newSetGroup.sets.length === 0) {
            newSetGroup.sets = generateSetsFromGroup(newSetGroup);
        }
        exercise.setGroups.push(newSetGroup);
        return {
            success: true,
            program: newProgram,
            modifiedTargets: [{ ...target, setGroupIndex: exercise.setGroups.length - 1 }],
        };
    }
    /**
     * Remove a SetGroup from an exercise
     */
    static removeSetGroup(program, target) {
        if (target.setGroupIndex === undefined) {
            return { success: false, error: 'setGroupIndex is required' };
        }
        const newProgram = deepClone(program);
        const weekIdx = newProgram.weeks.findIndex((w) => w.weekNumber === target.weekNumber);
        if (weekIdx === -1)
            return { success: false, error: 'Week not found' };
        const dayIdx = newProgram.weeks[weekIdx].days.findIndex((d) => d.dayNumber === target.dayNumber);
        if (dayIdx === -1)
            return { success: false, error: 'Day not found' };
        const exercise = newProgram.weeks[weekIdx].days[dayIdx].exercises[target.exerciseIndex];
        if (!exercise)
            return { success: false, error: 'Exercise not found' };
        if (exercise.setGroups.length <= 1) {
            return { success: false, error: 'Cannot remove the last SetGroup' };
        }
        exercise.setGroups.splice(target.setGroupIndex, 1);
        return {
            success: true,
            program: newProgram,
            modifiedTargets: [target],
        };
    }
    /**
     * Duplicate a SetGroup within the same exercise
     */
    static duplicateSetGroup(program, target) {
        if (target.setGroupIndex === undefined) {
            return { success: false, error: 'setGroupIndex is required' };
        }
        const exercise = getExerciseAtTarget(program, target);
        if (!exercise)
            return { success: false, error: 'Exercise not found' };
        const setGroup = exercise.setGroups[target.setGroupIndex];
        if (!setGroup)
            return { success: false, error: 'SetGroup not found' };
        const newSetGroup = deepClone(setGroup);
        newSetGroup.id = createId();
        return this.addSetGroup(program, target, newSetGroup);
    }
    /**
     * Copy progression pattern from one exercise to another
     */
    static copyProgressionPattern(program, sourceExerciseName, targetExerciseName) {
        const newProgram = deepClone(program);
        // Find all occurrences of source and target exercises
        const sourceOccurrences = [];
        const targetOccurrences = [];
        newProgram.weeks.forEach((week, weekIdx) => {
            week.days.forEach((day, dayIdx) => {
                day.exercises.forEach((exercise, exerciseIdx) => {
                    const name = exercise.name.toLowerCase();
                    if (name.includes(sourceExerciseName.toLowerCase())) {
                        sourceOccurrences.push({ weekIdx, dayIdx, exerciseIdx, setGroups: exercise.setGroups });
                    }
                    if (name.includes(targetExerciseName.toLowerCase())) {
                        targetOccurrences.push({ weekIdx, dayIdx, exerciseIdx });
                    }
                });
            });
        });
        if (sourceOccurrences.length === 0) {
            return { success: false, error: `Source exercise '${sourceExerciseName}' not found` };
        }
        if (targetOccurrences.length === 0) {
            return { success: false, error: `Target exercise '${targetExerciseName}' not found` };
        }
        // Apply pattern: copy setGroups structure (count, sets) but keep target's weights/reps
        targetOccurrences.forEach((target, idx) => {
            const sourceIdx = idx % sourceOccurrences.length;
            const source = sourceOccurrences[sourceIdx];
            const targetExercise = newProgram.weeks[target.weekIdx].days[target.dayIdx].exercises[target.exerciseIdx];
            if (targetExercise) {
                // Copy structure but preserve exercise-specific values
                source.setGroups.forEach((srcGroup, groupIdx) => {
                    if (targetExercise.setGroups[groupIdx]) {
                        // Preserve count pattern
                        targetExercise.setGroups[groupIdx].count = srcGroup.count;
                        // Regenerate sets with new count
                        const newSets = [];
                        for (let i = 0; i < srcGroup.count; i++) {
                            newSets.push({ ...targetExercise.setGroups[groupIdx].baseSet });
                        }
                        targetExercise.setGroups[groupIdx].sets = newSets;
                    }
                });
            }
        });
        return {
            success: true,
            program: newProgram,
        };
    }
    // =====================================================
    // Private Helper Methods
    // =====================================================
    /**
     * Resize a SetGroup to a new count
     */
    static resizeSetGroup(group, newCount) {
        const count = Math.max(1, Math.round(newCount));
        group.count = count;
        if (count > group.sets.length) {
            // Add sets by cloning the last one or baseSet
            const template = group.sets[group.sets.length - 1] || group.baseSet;
            const toAdd = count - group.sets.length;
            for (let i = 0; i < toAdd; i++) {
                group.sets.push(deepClone(template));
            }
        }
        else if (count < group.sets.length) {
            // Remove excess sets
            group.sets = group.sets.slice(0, count);
        }
    }
    /**
     * Process set field updates with automatic conversions
     */
    static processSetFieldUpdates(updates, _currentSet, oneRepMax) {
        const result = { ...updates };
        // Weight <-> WeightLbs conversion
        if (updates.weight !== undefined) {
            result.weight = updates.weight;
            result.weightLbs = Number(kgToLbs(updates.weight).toFixed(1));
            // If we have 1RM, calculate intensity
            if (oneRepMax && oneRepMax > 0) {
                result.intensityPercent = Number(calculateIntensityFromWeight(updates.weight, oneRepMax).toFixed(1));
            }
        }
        else if (updates.weightLbs !== undefined) {
            result.weightLbs = updates.weightLbs;
            result.weight = Number(lbsToKg(updates.weightLbs).toFixed(1));
            if (oneRepMax && oneRepMax > 0) {
                result.intensityPercent = Number(calculateIntensityFromWeight(result.weight, oneRepMax).toFixed(1));
            }
        }
        // Intensity -> Weight conversion (if 1RM available and weight not explicitly set)
        if (updates.intensityPercent !== undefined &&
            updates.weight === undefined &&
            oneRepMax &&
            oneRepMax > 0) {
            result.intensityPercent = updates.intensityPercent;
            result.weight = Number(calculateWeightFromIntensity(oneRepMax, updates.intensityPercent).toFixed(1));
            result.weightLbs = Number(kgToLbs(result.weight).toFixed(1));
        }
        // Handle max values
        if (updates.weightMax !== undefined) {
            result.weightMax = updates.weightMax;
            if (oneRepMax && oneRepMax > 0) {
                result.intensityPercentMax = Number(calculateIntensityFromWeight(updates.weightMax, oneRepMax).toFixed(1));
            }
        }
        // RPE clamping
        if (updates.rpe !== undefined) {
            result.rpe = Math.min(10, Math.max(1, Math.round(updates.rpe)));
        }
        if (updates.rpeMax !== undefined) {
            result.rpeMax = Math.min(10, Math.max(1, Math.round(updates.rpeMax)));
        }
        // Intensity clamping
        if (result.intensityPercent !== undefined && result.intensityPercent !== null) {
            result.intensityPercent = Math.min(100, Math.max(0, result.intensityPercent));
        }
        return result;
    }
}
// Export types and service
export default GranularSessionService;
