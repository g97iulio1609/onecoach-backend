/**
 * Workout Normalization Service
 *
 * Centralized service for normalizing workout programs and calculating weights
 * based on user's 1RM. Follows SOLID principles with single responsibility.
 */
import { OneRepMaxService } from '@onecoach/lib-exercise/one-rep-max.service';
import { normalizeAgentWorkoutPayload } from './helpers/program-server-transform';
import { calculateSetWeights } from './workout-weight-calculator.service';
import { getExerciseSets, generateSetGroupId } from './helpers/utils/set-group-helpers';
/**
 * Normalize workout program and calculate weights based on user's 1RM
 * @param rawPayload - Raw workout payload from AI agent
 * @param userId - User ID for 1RM lookup (optional)
 * @param baseProgram - Base program data (optional)
 * @returns Normalized workout program with calculated weights
 */
export async function normalizeWithWeightCalculation(rawPayload, userId, baseProgram) {
    // First, normalize the structure
    const normalizedProgram = await normalizeAgentWorkoutPayload(rawPayload, baseProgram);
    // If no userId provided, return normalized program without weight calculation
    if (!userId) {
        return normalizedProgram;
    }
    // Collect all catalogExerciseIds in the program
    const exerciseIds = new Set();
    normalizedProgram.weeks.forEach((week) => week.days.forEach((day) => day.exercises.forEach((exercise) => {
        if (exercise.catalogExerciseId) {
            exerciseIds.add(exercise.catalogExerciseId);
        }
    })));
    // Load 1RM for all exercises in the program
    const userMaxesMap = new Map();
    if (exerciseIds.size > 0) {
        const maxesResult = await OneRepMaxService.getBatchByExercises(userId, Array.from(exerciseIds));
        if (maxesResult.success && maxesResult.data) {
            maxesResult.data.forEach((max, catalogExerciseId) => {
                const oneRM = typeof max.oneRepMax === 'number' ? max.oneRepMax : Number(max.oneRepMax);
                userMaxesMap.set(catalogExerciseId, oneRM);
            });
        }
    }
    // Apply weight calculations to all exercises
    const programWithWeights = {
        ...normalizedProgram,
        weeks: normalizedProgram.weeks.map((week) => ({
            ...week,
            days: week.days.map((day) => ({
                ...day,
                exercises: day.exercises.map((exercise) => {
                    // Skip calculation if no catalogExerciseId
                    if (!exercise.catalogExerciseId) {
                        return exercise;
                    }
                    // Get 1RM for this exercise
                    const oneRepMaxKg = userMaxesMap.get(exercise.catalogExerciseId);
                    if (!oneRepMaxKg || oneRepMaxKg <= 0) {
                        return exercise;
                    }
                    // SSOT: Aggiorna setGroups, non exercise.sets legacy
                    const currentSets = getExerciseSets(exercise);
                    const updatedSets = currentSets.map((set) => calculateSetWeights(set, oneRepMaxKg));
                    // Aggiorna setGroups con i nuovi pesi
                    let updatedSetGroups;
                    if (exercise.setGroups && exercise.setGroups.length > 0) {
                        let setIdx = 0;
                        updatedSetGroups = exercise.setGroups.map((group) => {
                            const groupSetsCount = group.sets.length;
                            const newGroupSets = updatedSets.slice(setIdx, setIdx + groupSetsCount);
                            const updatedBaseSet = calculateSetWeights(group.baseSet, oneRepMaxKg);
                            setIdx += groupSetsCount;
                            return {
                                ...group,
                                baseSet: updatedBaseSet,
                                sets: newGroupSets,
                            };
                        });
                    }
                    else {
                        // Crea un singolo setGroup
                        const defaultSet = {
                            reps: undefined,
                            weight: null,
                            weightLbs: null,
                            rest: 60,
                            intensityPercent: null,
                            rpe: null,
                        };
                        updatedSetGroups = [
                            {
                                id: generateSetGroupId(),
                                count: updatedSets.length,
                                baseSet: updatedSets[0] || defaultSet,
                                sets: updatedSets,
                            },
                        ];
                    }
                    return {
                        ...exercise,
                        setGroups: updatedSetGroups,
                    };
                }),
            })),
        })),
    };
    return programWithWeights;
}
