/**
 * Workout Action Handlers
 *
 * Domain-specific action handlers for workout modifications.
 * Used by createAgenticTool to generate the unified modification tool.
 *
 * @module lib-mcp-server/tools/workout/workout.actions
 */

import { z } from 'zod';
import type { AgenticActionHandler } from '../shared/agentic-framework';
import { generateId } from '../shared/schema-builders';

// =====================================================
// Types
// =====================================================

/**
 * Workout program structure (simplified for runtime use)
 */
export interface WorkoutProgramData {
  weeks: WorkoutWeekData[];
  [key: string]: unknown;
}

export interface WorkoutWeekData {
  days: WorkoutDayData[];
  focus?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface WorkoutDayData {
  name?: string;
  exercises: WorkoutExerciseData[];
  [key: string]: unknown;
}

export interface WorkoutExerciseData {
  id?: string;
  name: string;
  catalogExerciseId?: string;
  setGroups: WorkoutSetGroupData[];
  [key: string]: unknown;
}

export interface WorkoutSetGroupData {
  id?: string;
  count: number;
  baseSet?: WorkoutSetData;
  sets?: WorkoutSetData[];
  [key: string]: unknown;
}

export interface WorkoutSetData {
  reps?: number;
  repsMax?: number;
  weight?: number | null;
  weightMax?: number | null;
  intensityPercent?: number | null;
  intensityPercentMax?: number | null;
  rpe?: number | null;
  rpeMax?: number | null;
  rest?: number;
  duration?: number;
  setNumber?: number;
  [key: string]: unknown;
}

// =====================================================
// Target Schema
// =====================================================

export const WorkoutTargetSchema = z.object({
  weekIndex: z.number().int().min(0).optional().describe('Week index (0-based)'),
  dayIndex: z.number().int().min(0).optional().describe('Day index (0-based)'),
  exerciseIndex: z.number().int().min(0).optional().describe('Exercise index (0-based)'),
  exerciseName: z.string().optional().describe('Exercise name for fuzzy matching'),
  setgroupIndex: z.number().int().min(0).optional().describe('SetGroup index (0-based)'),
  allMatching: z.boolean().optional().describe('Apply to all matching exercises'),
});

export type WorkoutTarget = z.infer<typeof WorkoutTargetSchema>;

// =====================================================
// Changes Schema (for update_setgroup)
// =====================================================

export const SetGroupChangesSchema = z.object({
  count: z.number().int().positive().optional().describe('Number of sets (for 5x5, count=5)'),
  reps: z.number().int().positive().optional().describe('Reps per set (for 5x5, reps=5)'),
  repsMax: z.number().int().positive().optional().describe('Max reps for ranges (8-12)'),
  weight: z.number().nonnegative().optional().describe('Weight in kg'),
  weightMax: z.number().nonnegative().optional().describe('Max weight for ranges'),
  intensityPercent: z.number().min(0).max(100).optional().describe('Intensity as % of 1RM'),
  intensityPercentMax: z.number().min(0).max(100).optional().describe('Max intensity %'),
  rpe: z.number().min(1).max(10).optional().describe('RPE 1-10'),
  rpeMax: z.number().min(1).max(10).optional().describe('Max RPE'),
  rest: z.number().int().positive().optional().describe('Rest in seconds'),
  duration: z.number().positive().optional().describe('Duration in seconds'),
});

// =====================================================
// Helper Functions
// =====================================================

/**
 * Find exercise by fuzzy name match.
 */
function findExerciseByName(
  day: WorkoutDayData,
  exerciseName: string
): { exerciseIndex: number; exercise: WorkoutExerciseData } | null {
  const nameLower = exerciseName.toLowerCase();
  const exerciseIndex = day.exercises.findIndex((ex) =>
    ex.name?.toLowerCase().includes(nameLower)
  );
  if (exerciseIndex === -1) return null;
  return { exerciseIndex, exercise: day.exercises[exerciseIndex]! };
}

/**
 * Parse rep range string (e.g., "6-8") to reps/repsMax.
 */
function parseRepRange(range: string | undefined): { reps?: number; repsMax?: number } {
  if (!range) return {};
  const rangeMatch = range.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (rangeMatch?.[1] && rangeMatch?.[2]) {
    return { reps: parseInt(rangeMatch[1], 10), repsMax: parseInt(rangeMatch[2], 10) };
  }
  const singleMatch = range.match(/^(\d+)$/);
  if (singleMatch?.[1]) {
    return { reps: parseInt(singleMatch[1], 10) };
  }
  return {};
}

// =====================================================
// Context Interface
// =====================================================

export interface WorkoutModificationContext {
  defaultWeekIndex?: number;
  defaultDayIndex?: number;
}

// =====================================================
// Action: update_setgroup
// =====================================================

export const updateSetgroupAction: AgenticActionHandler<WorkoutProgramData> = {
  description: 'Update setgroup (sets, reps, weight, intensity, rest, rpe). For "5x5" use count:5, reps:5',
  targetSchema: WorkoutTargetSchema,
  changesSchema: SetGroupChangesSchema,

  execute: (program, { target, changes }, context) => {
    const t = target as WorkoutTarget;
    const c = changes as z.infer<typeof SetGroupChangesSchema>;
    const ctx = ((context as Record<string, unknown>)?.workout || {}) as WorkoutModificationContext;

    if (!c || Object.keys(c).length === 0) {
      throw new Error('Empty changes. Specify at least one field (count, reps, weight, intensityPercent, rest, rpe).');
    }

    const weekIndex = t.weekIndex ?? ctx.defaultWeekIndex ?? 0;
    const dayIndex = t.dayIndex ?? ctx.defaultDayIndex ?? 0;
    const week = program.weeks[weekIndex];
    if (!week) throw new Error(`Week ${weekIndex} not found`);
    const day = week.days[dayIndex];
    if (!day) throw new Error(`Day ${dayIndex} not found`);

    // Find exercise
    let targetExerciseIndex = t.exerciseIndex;
    let targetExercise: WorkoutExerciseData | null = null;

    if (t.exerciseName && targetExerciseIndex === undefined) {
      const found = findExerciseByName(day, t.exerciseName);
      if (!found) throw new Error(`Exercise "${t.exerciseName}" not found`);
      targetExerciseIndex = found.exerciseIndex;
      targetExercise = found.exercise;
    } else if (targetExerciseIndex !== undefined) {
      targetExercise = day.exercises[targetExerciseIndex] ?? null;
      if (!targetExercise) throw new Error(`Exercise index ${targetExerciseIndex} not found`);
    }

    if (targetExercise === null || targetExerciseIndex === undefined) {
      throw new Error('Exercise target required');
    }

    const sgIdx = t.setgroupIndex ?? 0;
    const setGroups = targetExercise.setGroups;
    if (!setGroups || sgIdx >= setGroups.length) {
      throw new Error(`SetGroup ${sgIdx} not found`);
    }

    const currentSetGroup = setGroups[sgIdx]!;
    const updatedSetGroup: WorkoutSetGroupData = {
      ...currentSetGroup,
      count: c.count ?? currentSetGroup.count,
    };

    // Update baseSet
    const baseSetFields = ['reps', 'repsMax', 'weight', 'weightMax', 'intensityPercent', 'intensityPercentMax', 'rpe', 'rpeMax', 'rest', 'duration'] as const;
    if (currentSetGroup.baseSet) {
      const baseSetChanges: Partial<WorkoutSetData> = {};
      for (const field of baseSetFields) {
        if (c[field] !== undefined) {
          baseSetChanges[field] = c[field] as number;
        }
      }
      if (Object.keys(baseSetChanges).length > 0) {
        updatedSetGroup.baseSet = { ...currentSetGroup.baseSet, ...baseSetChanges };
      }
    }

    // Handle count change
    if (c.count !== undefined && c.count !== currentSetGroup.count) {
      const newCount = c.count;
      const currentSets = currentSetGroup.sets || [];
      const templateSet = updatedSetGroup.baseSet || { reps: 10 };

      if (newCount > currentSets.length) {
        const newSets = [...currentSets];
        while (newSets.length < newCount) {
          newSets.push({ ...templateSet, setNumber: newSets.length + 1 });
        }
        updatedSetGroup.sets = newSets;
      } else if (newCount < currentSets.length) {
        updatedSetGroup.sets = currentSets.slice(0, newCount);
      }
    }

    // Propagate changes to all sets
    if (updatedSetGroup.baseSet && updatedSetGroup.sets && updatedSetGroup.sets.length > 0) {
      const fieldsToPropagate: Partial<WorkoutSetData> = {};
      for (const field of baseSetFields) {
        if (c[field] !== undefined && updatedSetGroup.baseSet) {
          fieldsToPropagate[field] = updatedSetGroup.baseSet[field] as number;
        }
      }
      if (Object.keys(fieldsToPropagate).length > 0) {
        updatedSetGroup.sets = updatedSetGroup.sets.map((set, idx) => ({
          ...set,
          ...fieldsToPropagate,
          setNumber: idx + 1,
        }));
      }
    }

    program.weeks[weekIndex]!.days[dayIndex]!.exercises[targetExerciseIndex]!.setGroups[sgIdx] = updatedSetGroup;
    return program;
  },
};

// =====================================================
// Action: add_setgroup
// =====================================================

const AddSetGroupDataSchema = z.object({
  id: z.string().optional(),
  count: z.number().int().positive().optional().default(3),
  baseSet: z.object({
    reps: z.number().int().positive().optional(),
    intensityPercent: z.number().min(0).max(100).optional(),
    rest: z.number().int().positive().optional(),
    weight: z.number().optional(),
    rpe: z.number().min(1).max(10).optional(),
  }).optional(),
  sets: z.array(z.record(z.string(), z.unknown())).optional(),
});

export const addSetgroupAction: AgenticActionHandler<WorkoutProgramData> = {
  description: 'Add a new setgroup to an exercise',
  targetSchema: WorkoutTargetSchema,
  newDataSchema: AddSetGroupDataSchema,

  execute: (program, { target, newData }, context) => {
    const t = target as WorkoutTarget;
    const payload = (newData || {}) as z.infer<typeof AddSetGroupDataSchema>;
    const ctx = ((context as Record<string, unknown>)?.workout || {}) as WorkoutModificationContext;

    const weekIndex = t.weekIndex ?? ctx.defaultWeekIndex ?? 0;
    const dayIndex = t.dayIndex ?? ctx.defaultDayIndex ?? 0;
    const week = program.weeks[weekIndex];
    if (!week) throw new Error(`Week ${weekIndex} not found`);
    const day = week.days[dayIndex];
    if (!day) throw new Error(`Day ${dayIndex} not found`);

    let targetExerciseIndex = t.exerciseIndex;
    if (t.exerciseName && targetExerciseIndex === undefined) {
      const found = findExerciseByName(day, t.exerciseName);
      if (!found) throw new Error(`Exercise "${t.exerciseName}" not found`);
      targetExerciseIndex = found.exerciseIndex;
    }
    if (targetExerciseIndex === undefined) throw new Error('Exercise target required');

    const exercise = day.exercises[targetExerciseIndex];
    if (!exercise) throw new Error('Exercise not found');
    if (!exercise.setGroups) exercise.setGroups = [];

    const newSetGroup: WorkoutSetGroupData = {
      id: payload.id || generateId('sg'),
      count: payload.count || 3,
      baseSet: {
        reps: 10,
        rest: 90,
        intensityPercent: 70,
        ...(payload.baseSet || {}),
      },
      sets: payload.sets as WorkoutSetData[] || [],
    };

    exercise.setGroups.push(newSetGroup);
    return program;
  },
};

// =====================================================
// Action: remove_setgroup
// =====================================================

export const removeSetgroupAction: AgenticActionHandler<WorkoutProgramData> = {
  description: 'Remove a setgroup from an exercise',
  targetSchema: WorkoutTargetSchema,

  execute: (program, { target }, context) => {
    const t = target as WorkoutTarget;
    const ctx = ((context as Record<string, unknown>)?.workout || {}) as WorkoutModificationContext;

    const weekIndex = t.weekIndex ?? ctx.defaultWeekIndex ?? 0;
    const dayIndex = t.dayIndex ?? ctx.defaultDayIndex ?? 0;
    const week = program.weeks[weekIndex];
    if (!week) throw new Error(`Week ${weekIndex} not found`);
    const day = week.days[dayIndex];
    if (!day) throw new Error(`Day ${dayIndex} not found`);

    let targetExerciseIndex = t.exerciseIndex;
    if (t.exerciseName && targetExerciseIndex === undefined) {
      const found = findExerciseByName(day, t.exerciseName);
      if (!found) throw new Error(`Exercise "${t.exerciseName}" not found`);
      targetExerciseIndex = found.exerciseIndex;
    }
    if (targetExerciseIndex === undefined) throw new Error('Exercise target required');

    const exercise = day.exercises[targetExerciseIndex];
    if (!exercise) throw new Error('Exercise not found');

    const sgIdx = t.setgroupIndex ?? 0;
    if (!exercise.setGroups || sgIdx >= exercise.setGroups.length) {
      throw new Error(`SetGroup ${sgIdx} not found`);
    }

    exercise.setGroups.splice(sgIdx, 1);
    return program;
  },
};

// =====================================================
// Action: update_exercise
// =====================================================

const ExerciseChangesSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  typeLabel: z.string().optional(),
  repRange: z.string().optional(),
  formCues: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
});

export const updateExerciseAction: AgenticActionHandler<WorkoutProgramData> = {
  description: 'Update exercise properties (name, notes, form cues, equipment)',
  targetSchema: WorkoutTargetSchema,
  changesSchema: ExerciseChangesSchema,

  execute: (program, { target, changes }, context) => {
    const t = target as WorkoutTarget;
    const c = changes as z.infer<typeof ExerciseChangesSchema>;
    const ctx = ((context as Record<string, unknown>)?.workout || {}) as WorkoutModificationContext;

    const weekIndex = t.weekIndex ?? ctx.defaultWeekIndex ?? 0;
    const dayIndex = t.dayIndex ?? ctx.defaultDayIndex ?? 0;
    const week = program.weeks[weekIndex];
    if (!week) throw new Error(`Week ${weekIndex} not found`);
    const day = week.days[dayIndex];
    if (!day) throw new Error(`Day ${dayIndex} not found`);

    let targetExerciseIndex = t.exerciseIndex;
    if (t.exerciseName && targetExerciseIndex === undefined) {
      const found = findExerciseByName(day, t.exerciseName);
      if (!found) throw new Error(`Exercise "${t.exerciseName}" not found`);
      targetExerciseIndex = found.exerciseIndex;
    }
    if (targetExerciseIndex === undefined) throw new Error('Exercise target required');

    const exercise = day.exercises[targetExerciseIndex];
    if (!exercise) throw new Error('Exercise not found');

    Object.assign(exercise, c);
    return program;
  },
};

// =====================================================
// Action: add_exercise
// =====================================================

const AddExerciseDataSchema = z.object({
  id: z.string().optional(),
  name: z.string().describe('Exercise name'),
  catalogExerciseId: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  typeLabel: z.string().optional(),
  repRange: z.string().optional(),
  formCues: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  muscleGroups: z.array(z.string()).optional(),
  category: z.string().optional(),
  setGroups: z.array(z.object({
    count: z.number().int().positive().optional(),
    baseSet: z.object({
      reps: z.number().int().positive().optional(),
      repsMax: z.number().int().positive().optional(),
      intensityPercent: z.number().min(0).max(100).optional(),
      rest: z.number().int().positive().optional(),
      rpe: z.number().min(1).max(10).optional(),
    }).optional(),
  })).min(1).describe('REQUIRED: At least one setgroup'),
});

type AddExerciseInput = z.infer<typeof AddExerciseDataSchema>;

export const addExerciseAction: AgenticActionHandler<WorkoutProgramData> = {
  description: 'Add a new exercise to a day (REQUIRES setGroups)',
  targetSchema: WorkoutTargetSchema,
  newDataSchema: AddExerciseDataSchema,

  execute: async (program, { target, newData }, context) => {
    const t = target as WorkoutTarget;
    const payload = newData as AddExerciseInput;
    const ctx = ((context as Record<string, unknown>)?.workout || {}) as WorkoutModificationContext;

    if (!payload?.setGroups || payload.setGroups.length === 0) {
      throw new Error('setGroups is REQUIRED for add_exercise');
    }

    const weekIndex = t.weekIndex ?? ctx.defaultWeekIndex ?? 0;
    const dayIndex = t.dayIndex ?? ctx.defaultDayIndex ?? 0;
    const week = program.weeks[weekIndex];
    if (!week) throw new Error(`Week ${weekIndex} not found`);
    const day = week.days[dayIndex];
    if (!day) throw new Error(`Day ${dayIndex} not found`);

    // Try to resolve from catalog if needed
    let exerciseName = payload.name;
    let catalogExerciseId = payload.catalogExerciseId || '';
    let muscleGroups = payload.muscleGroups || [];
    let equipment = payload.equipment || [];
    let category = payload.category || 'strength';

    if (!catalogExerciseId && exerciseName) {
      try {
        const { resolveExerciseByName } = await import('../../utils/exercise-catalog.utils');
        const resolved = await resolveExerciseByName(exerciseName);
        if (resolved) {
          catalogExerciseId = resolved.catalogExerciseId;
          exerciseName = resolved.nameIt || resolved.name;
          muscleGroups = resolved.muscleGroups;
          equipment = resolved.equipment;
          category = resolved.category;
        }
      } catch {
        // Catalog resolution failed, use provided name
      }
    }

    const exerciseRepRange = parseRepRange(payload.repRange);

    const exerciseToAdd: WorkoutExerciseData = {
      id: payload.id || generateId('ex'),
      name: exerciseName,
      catalogExerciseId,
      setGroups: payload.setGroups.map((sg) => {
        const baseReps = sg.baseSet?.reps ?? exerciseRepRange.reps ?? 10;
        const baseRepsMax = sg.baseSet?.repsMax ?? exerciseRepRange.repsMax;
        const count = sg.count || 3;

        const baseSet: WorkoutSetData = {
          reps: baseReps,
          repsMax: baseRepsMax,
          weight: null,
          rest: sg.baseSet?.rest ?? 90,
          intensityPercent: sg.baseSet?.intensityPercent ?? 70,
          rpe: sg.baseSet?.rpe ?? null,
        };

        const sets = Array.from({ length: count }, (_, i) => ({
          ...baseSet,
          setNumber: i + 1,
        }));

        return {
          id: generateId('sg'),
          count,
          baseSet,
          sets,
        };
      }),
      notes: payload.notes || '',
      typeLabel: payload.typeLabel || '',
      repRange: payload.repRange || '8-12',
      formCues: payload.formCues || [],
      equipment,
      muscleGroups,
      category,
      description: payload.description || '',
    };

    if (!day.exercises) day.exercises = [];
    day.exercises.push(exerciseToAdd);
    return program;
  },
};

// =====================================================
// Action: remove_exercise
// =====================================================

export const removeExerciseAction: AgenticActionHandler<WorkoutProgramData> = {
  description: 'Remove an exercise from a day',
  targetSchema: WorkoutTargetSchema,

  execute: (program, { target }, context) => {
    const t = target as WorkoutTarget;
    const ctx = ((context as Record<string, unknown>)?.workout || {}) as WorkoutModificationContext;

    const weekIndex = t.weekIndex ?? ctx.defaultWeekIndex ?? 0;
    const dayIndex = t.dayIndex ?? ctx.defaultDayIndex ?? 0;
    const week = program.weeks[weekIndex];
    if (!week) throw new Error(`Week ${weekIndex} not found`);
    const day = week.days[dayIndex];
    if (!day) throw new Error(`Day ${dayIndex} not found`);

    let targetExerciseIndex = t.exerciseIndex;
    if (t.exerciseName && targetExerciseIndex === undefined) {
      const found = findExerciseByName(day, t.exerciseName);
      if (!found) throw new Error(`Exercise "${t.exerciseName}" not found`);
      targetExerciseIndex = found.exerciseIndex;
    }
    if (targetExerciseIndex === undefined) throw new Error('Exercise target required');

    day.exercises.splice(targetExerciseIndex, 1);
    return program;
  },
};

// =====================================================
// Export All Actions
// =====================================================

export const workoutActions = {
  update_setgroup: updateSetgroupAction,
  add_setgroup: addSetgroupAction,
  remove_setgroup: removeSetgroupAction,
  update_exercise: updateExerciseAction,
  add_exercise: addExerciseAction,
  remove_exercise: removeExerciseAction,
} as const;
