/**
 * MCP Tools: Granular Session Management
 *
 * Advanced MCP tools for granular manipulation of workout sessions.
 * Provides fine-grained control over every field at every level.
 *
 * SOLID Principles:
 * - Single Responsibility: Each tool does one thing well
 * - Open/Closed: Extensible through new tool additions
 * - Interface Segregation: Small, focused tool interfaces
 *
 * @module lib-mcp-server/tools/workout/granular
 */

import { z } from 'zod';
import type { McpTool } from '../../types';
import { GranularSessionService } from '@onecoach/lib-workout';
import { workoutProgramSchema } from '@onecoach/schemas';
import { normalizeWorkoutProgram } from './program-normalizer';
import { prisma } from '@onecoach/lib-core';
import { Prisma } from '@prisma/client';

// =====================================================
// MCP-Safe Schema (JSON-compatible for AI SDK)
// =====================================================

/**
 * MCP-safe version of workoutProgramSchema
 * 
 * The original schema uses z.coerce.date() for createdAt/updatedAt which
 * cannot be converted to JSON Schema for AI SDK tool definitions.
 * This version uses z.string() for timestamps instead.
 */
const mcpWorkoutProgramSchema = workoutProgramSchema.extend({
  createdAt: z.string().optional().describe('ISO 8601 timestamp'),
  updatedAt: z.string().optional().describe('ISO 8601 timestamp'),
});

// =====================================================
// Schema Definitions
// =====================================================

/**
 * Session Target Schema - identifies a location in the program
 */
const SessionTargetSchema = z.object({
  weekNumber: z.number().int().positive().describe('Week number (1-based)'),
  dayNumber: z.number().int().positive().describe('Day number within the week (1-based)'),
  exerciseIndex: z.number().int().nonnegative().describe('Exercise index (0-based)'),
  setGroupIndex: z.number().int().nonnegative().optional().describe('SetGroup index (0-based)'),
  setIndex: z.number().int().nonnegative().optional().describe('Set index within group (0-based)'),
});

/**
 * Set Field Update Schema - granular field updates for sets
 * Each field has explicit description for AI model guidance
 */
const SetFieldUpdateSchema = z.object({
  reps: z.number().int().positive().optional().describe(
    'REQUIRED when changing reps! For "5x5" the second number is reps. Example: "5x5" → reps: 5'
  ),
  repsMax: z.number().int().positive().optional().describe('Maximum reps for rep ranges like "8-12"'),
  duration: z.number().positive().optional().describe('Duration in seconds for time-based exercises'),
  weight: z.number().nonnegative().optional().describe('Weight in kg. Example: "100kg" → weight: 100'),
  weightMax: z.number().nonnegative().optional().describe('Maximum weight in kg for ranges'),
  weightLbs: z.number().nonnegative().optional().describe('Weight in lbs (auto-calculated)'),
  intensityPercent: z.number().min(0).max(100).optional().describe(
    'REQUIRED when user mentions percentage! Intensity as % of 1RM. Example: "80%" → intensityPercent: 80'
  ),
  intensityPercentMax: z.number().min(0).max(100).optional().describe('Max intensity % for ranges'),
  rpe: z.number().min(1).max(10).optional().describe('RPE (Rate of Perceived Exertion) 1-10'),
  rpeMax: z.number().min(1).max(10).optional().describe('Maximum RPE for ranges'),
  rest: z.number().int().positive().optional().describe('Rest time in seconds. Example: "60s rest" → rest: 60'),
});

/**
 * SetGroup Update Schema - includes count and all set fields
 * IMPORTANT: For "5x5" notation, BOTH count AND reps are required!
 */
const SetGroupUpdateSchema = SetFieldUpdateSchema.extend({
  count: z.number().int().positive().optional().describe(
    'REQUIRED when changing number of sets! For "5x5" the first number is count. Example: "5x5" → count: 5, reps: 5 (BOTH!)'
  ),
});

/**
 * Exercise Update Schema
 */
const ExerciseUpdateSchema = z.object({
  name: z.string().min(1).optional().describe('Exercise name'),
  description: z.string().optional().describe('Exercise description'),
  notes: z.string().optional().describe('Additional notes'),
  typeLabel: z.string().optional().describe('Type label (e.g., "Compound", "Isolation")'),
  repRange: z.string().optional().describe('Rep range display (e.g., "8-12")'),
  formCues: z.array(z.string()).optional().describe('Form cues for proper execution'),
  equipment: z.array(z.string()).optional().describe('Required equipment'),
  videoUrl: z.string().url().optional().describe('Video demonstration URL'),
});

/**
 * Day Update Schema
 */
const DayUpdateSchema = z.object({
  name: z.string().optional().describe('Day name'),
  notes: z.string().optional().describe('Day notes'),
  warmup: z.string().optional().describe('Warmup instructions'),
  cooldown: z.string().optional().describe('Cooldown instructions'),
  totalDuration: z.number().positive().optional().describe('Total duration in minutes'),
  targetMuscles: z.array(z.string()).optional().describe('Target muscle groups'),
});

/**
 * Week Update Schema
 */
const WeekUpdateSchema = z.object({
  focus: z.string().optional().describe('Week focus (e.g., "Volume", "Intensity")'),
  notes: z.string().optional().describe('Week notes'),
});

// =====================================================
// Tool: Granular Set Group Update
// =====================================================

const granularSetGroupUpdateParams = z.object({
  program: mcpWorkoutProgramSchema,
  target: SessionTargetSchema,
  update: SetGroupUpdateSchema,
  oneRepMax: z
    .number()
    .positive()
    .optional()
    .describe('1RM value for automatic intensity calculations'),
});

type GranularSetGroupUpdateParams = z.infer<typeof granularSetGroupUpdateParams>;

export const workoutGranularSetGroupUpdateTool: McpTool<GranularSetGroupUpdateParams> = {
  name: 'workout_granular_setgroup_update',
  description: `Updates a specific SetGroup with granular field changes.
  
Supports:
- Changing set count (adds/removes sets)
- Updating reps, weight, intensity, RPE, rest
- Automatic kg <-> lbs conversion
- Automatic weight <-> intensity conversion (if 1RM provided)
- Range values (min/max) for progressive sets

Example: "Change Week 2, Day 1, Exercise 0 to 5 sets of 8 reps at RPE 8"`,
  parameters: granularSetGroupUpdateParams,
  execute: async (args) => {
    const { program, target, update, oneRepMax } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    const result = GranularSessionService.updateSetGroup(
      normalizedProgram,
      target,
      update,
      oneRepMax
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      program: result.program,
      message: `Updated SetGroup at Week ${target.weekNumber}, Day ${target.dayNumber}, Exercise ${target.exerciseIndex}`,
      modifiedFields: Object.keys(update),
    };
  },
};

// =====================================================
// Tool: Granular Individual Set Update
// =====================================================

const granularIndividualSetUpdateParams = z.object({
  program: mcpWorkoutProgramSchema,
  target: SessionTargetSchema.extend({
    setGroupIndex: z.number().int().nonnegative(),
    setIndex: z.number().int().nonnegative(),
  }),
  update: SetFieldUpdateSchema,
  oneRepMax: z.number().positive().optional(),
});

type GranularIndividualSetUpdateParams = z.infer<typeof granularIndividualSetUpdateParams>;

export const workoutGranularIndividualSetUpdateTool: McpTool<GranularIndividualSetUpdateParams> = {
  name: 'workout_granular_individual_set_update',
  description: `Updates a specific individual set within a SetGroup.
  
Use this for:
- Creating pyramid sets (different weight/reps per set)
- Drop sets (decreasing weight)
- Ramping sets (increasing intensity)
- Custom progression within a single exercise

Example: "Set the 4th set of squats to be a backoff set at 80% of the weight"`,
  parameters: granularIndividualSetUpdateParams,
  execute: async (args) => {
    const { program, target, update, oneRepMax } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    const result = GranularSessionService.updateIndividualSet(
      normalizedProgram,
      target,
      update,
      oneRepMax
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      program: result.program,
      message: `Updated Set ${target.setIndex} in SetGroup ${target.setGroupIndex} at Week ${target.weekNumber}, Day ${target.dayNumber}, Exercise ${target.exerciseIndex}`,
    };
  },
};

// =====================================================
// Tool: Granular Exercise Update
// =====================================================

const granularExerciseUpdateParams = z.object({
  program: mcpWorkoutProgramSchema,
  target: SessionTargetSchema,
  update: ExerciseUpdateSchema,
});

type GranularExerciseUpdateParams = z.infer<typeof granularExerciseUpdateParams>;

export const workoutGranularExerciseUpdateTool: McpTool<GranularExerciseUpdateParams> = {
  name: 'workout_granular_exercise_update',
  description: `Updates exercise-level fields like name, description, notes, form cues, equipment.
  
Use this for:
- Renaming exercises
- Adding form cues or notes
- Updating equipment requirements
- Adding video links`,
  parameters: granularExerciseUpdateParams,
  execute: async (args) => {
    const { program, target, update } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    const result = GranularSessionService.updateExercise(normalizedProgram, target, update);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      program: result.program,
      message: `Updated Exercise at Week ${target.weekNumber}, Day ${target.dayNumber}, Exercise ${target.exerciseIndex}`,
      modifiedFields: Object.keys(update),
    };
  },
};

// =====================================================
// Tool: Granular Day Update
// =====================================================

const granularDayUpdateParams = z.object({
  program: mcpWorkoutProgramSchema,
  weekNumber: z.number().int().positive(),
  dayNumber: z.number().int().positive(),
  update: DayUpdateSchema,
});

type GranularDayUpdateParams = z.infer<typeof granularDayUpdateParams>;

export const workoutGranularDayUpdateTool: McpTool<GranularDayUpdateParams> = {
  name: 'workout_granular_day_update',
  description: `Updates day-level fields like name, notes, warmup, cooldown, duration.
  
Use this for:
- Renaming workout days
- Adding warmup/cooldown instructions
- Setting target muscles
- Adjusting estimated duration`,
  parameters: granularDayUpdateParams,
  execute: async (args) => {
    const { program, weekNumber, dayNumber, update } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    const result = GranularSessionService.updateDay(
      normalizedProgram,
      weekNumber,
      dayNumber,
      update
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      program: result.program,
      message: `Updated Day ${dayNumber} in Week ${weekNumber}`,
      modifiedFields: Object.keys(update),
    };
  },
};

// =====================================================
// Tool: Granular Week Update
// =====================================================

const granularWeekUpdateParams = z.object({
  program: mcpWorkoutProgramSchema,
  weekNumber: z.number().int().positive(),
  update: WeekUpdateSchema,
});

type GranularWeekUpdateParams = z.infer<typeof granularWeekUpdateParams>;

export const workoutGranularWeekUpdateTool: McpTool<GranularWeekUpdateParams> = {
  name: 'workout_granular_week_update',
  description: `Updates week-level fields like focus and notes.
  
Use this for:
- Setting weekly focus (Volume, Intensity, Deload)
- Adding weekly notes and instructions`,
  parameters: granularWeekUpdateParams,
  execute: async (args) => {
    const { program, weekNumber, update } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    const result = GranularSessionService.updateWeek(normalizedProgram, weekNumber, update);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      program: result.program,
      message: `Updated Week ${weekNumber}`,
      modifiedFields: Object.keys(update),
    };
  },
};

// =====================================================
// Tool: Batch Granular Update
// =====================================================

const batchUpdateOperationSchema = z.object({
  target: SessionTargetSchema,
  setGroupUpdate: SetGroupUpdateSchema.optional(),
  exerciseUpdate: ExerciseUpdateSchema.optional(),
  dayUpdate: DayUpdateSchema.optional(),
  weekUpdate: WeekUpdateSchema.optional(),
});

const batchGranularUpdateParams = z.object({
  program: mcpWorkoutProgramSchema,
  operations: z
    .array(batchUpdateOperationSchema)
    .min(1)
    .describe('Array of update operations to apply'),
  oneRepMax: z.number().positive().optional(),
});

type BatchGranularUpdateParams = z.infer<typeof batchGranularUpdateParams>;

export const workoutBatchGranularUpdateTool: McpTool<BatchGranularUpdateParams> = {
  name: 'workout_batch_granular_update',
  description: `Applies multiple granular updates in a single atomic operation.
  
Use this for:
- Updating multiple exercises at once
- Applying changes across multiple weeks
- Complex program modifications
- Ensuring all changes succeed or none apply

Example: "Increase weight by 2.5kg for all squat sessions across weeks 2-4"`,
  parameters: batchGranularUpdateParams,
  execute: async (args) => {
    const { program, operations, oneRepMax } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    const result = GranularSessionService.batchUpdate(normalizedProgram, operations, oneRepMax);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      program: result.program,
      message: `Applied ${operations.length} updates successfully`,
      modifiedTargets: result.modifiedTargets,
    };
  },
};

// =====================================================
// Tool: Add SetGroup
// =====================================================

const addSetGroupParams = z.object({
  program: mcpWorkoutProgramSchema,
  target: SessionTargetSchema,
  setGroup: z
    .object({
      count: z.number().int().positive().optional().default(3),
      baseSet: SetFieldUpdateSchema.optional(),
    })
    .optional(),
});

type AddSetGroupParams = z.infer<typeof addSetGroupParams>;

export const workoutAddSetGroupTool: McpTool<AddSetGroupParams> = {
  name: 'workout_add_setgroup',
  description: `Adds a new SetGroup to an exercise.
  
Use this for:
- Adding drop sets
- Adding backoff sets
- Creating supersets (multiple set groups)`,
  parameters: addSetGroupParams,
  execute: async (args) => {
    const { program, target, setGroup } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    // Convert the partial setGroup to the expected format
    const setGroupInput = setGroup
      ? {
          count: setGroup.count,
          baseSet: setGroup.baseSet
            ? {
                reps: setGroup.baseSet.reps,
                repsMax: setGroup.baseSet.repsMax,
                duration: setGroup.baseSet.duration,
                weight: setGroup.baseSet.weight ?? null,
                weightMax: setGroup.baseSet.weightMax ?? null,
                weightLbs: setGroup.baseSet.weightLbs ?? null,
                intensityPercent: setGroup.baseSet.intensityPercent ?? null,
                intensityPercentMax: setGroup.baseSet.intensityPercentMax ?? null,
                rpe: setGroup.baseSet.rpe ?? null,
                rpeMax: setGroup.baseSet.rpeMax ?? null,
                rest: setGroup.baseSet.rest ?? 90,
              }
            : undefined,
        }
      : {};

    const result = GranularSessionService.addSetGroup(normalizedProgram, target, setGroupInput);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      program: result.program,
      message: `Added new SetGroup to Exercise ${target.exerciseIndex} at Week ${target.weekNumber}, Day ${target.dayNumber}`,
    };
  },
};

// =====================================================
// Tool: Remove SetGroup
// =====================================================

const removeSetGroupParams = z.object({
  program: mcpWorkoutProgramSchema,
  target: SessionTargetSchema.extend({
    setGroupIndex: z.number().int().nonnegative(),
  }),
});

type RemoveSetGroupParams = z.infer<typeof removeSetGroupParams>;

export const workoutRemoveSetGroupTool: McpTool<RemoveSetGroupParams> = {
  name: 'workout_remove_setgroup',
  description: `Removes a SetGroup from an exercise.
  
Note: Cannot remove the last SetGroup (at least one must remain).`,
  parameters: removeSetGroupParams,
  execute: async (args) => {
    const { program, target } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    const result = GranularSessionService.removeSetGroup(normalizedProgram, target);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      program: result.program,
      message: `Removed SetGroup ${target.setGroupIndex} from Exercise ${target.exerciseIndex}`,
    };
  },
};

// =====================================================
// Tool: Duplicate SetGroup
// =====================================================

const duplicateSetGroupParams = z.object({
  program: mcpWorkoutProgramSchema,
  target: SessionTargetSchema.extend({
    setGroupIndex: z.number().int().nonnegative(),
  }),
});

type DuplicateSetGroupParams = z.infer<typeof duplicateSetGroupParams>;

export const workoutDuplicateSetGroupTool: McpTool<DuplicateSetGroupParams> = {
  name: 'workout_duplicate_setgroup',
  description: `Duplicates an existing SetGroup within the same exercise.
  
Use this for:
- Creating variations of existing sets
- Building complex set schemes`,
  parameters: duplicateSetGroupParams,
  execute: async (args) => {
    const { program, target } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    const result = GranularSessionService.duplicateSetGroup(normalizedProgram, target);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      program: result.program,
      message: `Duplicated SetGroup ${target.setGroupIndex} in Exercise ${target.exerciseIndex}`,
    };
  },
};

// =====================================================
// Tool: Copy Progression Pattern
// =====================================================

const copyProgressionPatternParams = z.object({
  program: mcpWorkoutProgramSchema,
  sourceExerciseName: z.string().describe('Name of the exercise to copy pattern from'),
  targetExerciseName: z.string().describe('Name of the exercise to apply pattern to'),
});

type CopyProgressionPatternParams = z.infer<typeof copyProgressionPatternParams>;

export const workoutCopyProgressionPatternTool: McpTool<CopyProgressionPatternParams> = {
  name: 'workout_copy_progression_pattern',
  description: `Copies the progression pattern (set counts) from one exercise to another.
  
Use this for:
- Applying consistent volume patterns
- Synchronizing exercise progressions`,
  parameters: copyProgressionPatternParams,
  execute: async (args) => {
    const { program, sourceExerciseName, targetExerciseName } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    const result = GranularSessionService.copyProgressionPattern(
      normalizedProgram,
      sourceExerciseName,
      targetExerciseName
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      program: result.program,
      message: `Copied progression pattern from "${sourceExerciseName}" to "${targetExerciseName}"`,
    };
  },
};

// =====================================================
// Tool: Persist Program (Save Granular Changes)
// =====================================================

const persistProgramParams = z.object({
  programId: z.string().describe('The ID of the program to persist'),
  program: mcpWorkoutProgramSchema.describe('The modified program object to save'),
});

type PersistProgramParams = z.infer<typeof persistProgramParams>;

export const workoutPersistProgramTool: McpTool<PersistProgramParams> = {
  name: 'workout_persist_program',
  description: `Persists a modified workout program to the database.
  
IMPORTANT: Use this tool AFTER making granular modifications (add_setgroup, 
remove_setgroup, granular_setgroup_update, etc.) to save the changes to the database.

This performs a PATCH operation - it only updates the weeks JSON structure,
preserving all other program metadata.

Workflow:
1. Use workout_get_program to retrieve the program
2. Apply granular modifications (workout_add_setgroup, etc.)
3. Call this tool with the modified program to persist changes`,
  parameters: persistProgramParams,
  execute: async (args) => {
    console.log('[MCP:workout_persist_program] 📥 Called with:', {
      programId: args.programId,
      weeksCount: args.program?.weeks?.length,
    });

    // DEBUG: Log detailed program structure to trace what AI sends
    if (args.program?.weeks) {
      args.program.weeks.forEach((week: any, wIdx: number) => {
        console.log(`[MCP:workout_persist_program] 📊 Week ${wIdx + 1}:`, {
          daysCount: week.days?.length || 0,
          days: week.days?.map((d: any, dIdx: number) => ({
            dayNumber: dIdx + 1,
            exercisesCount: d.exercises?.length || 0,
          })),
        });
      });
    }

    const { programId, program } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    // Verify program exists
    const existingProgram = await prisma.workout_programs.findUnique({
      where: { id: programId },
      select: { id: true },
    });

    if (!existingProgram) {
      console.log('[MCP:workout_persist_program] ❌ Program not found:', programId);
      return {
        success: false,
        error: `Program with ID ${programId} not found`,
      };
    }

    // PATCH: Only update the weeks structure, preserve everything else
    await prisma.workout_programs.update({
      where: { id: programId },
      data: {
        weeks: normalizedProgram.weeks as unknown as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    });

    console.log('[MCP:workout_persist_program] ✅ Saved successfully:', {
      programId,
      weeksCount: normalizedProgram.weeks.length,
    });

    return {
      success: true,
      programId,
      message: `Program ${programId} saved successfully with ${normalizedProgram.weeks.length} week(s)`,
    };
  },
};

// =====================================================
// Tool: Apply Modification (DIFF-based approach)
// =====================================================

/**
 * Modification action types for workout changes
 */
const ModificationActionSchema = z.enum([
  'update_setgroup',
  'add_setgroup',
  'remove_setgroup',
  'update_exercise',
  'add_exercise',
  'remove_exercise',
]);

/**
 * Target location in the program (can use index or name for fuzzy matching)
 * weekIndex/dayIndex are OPTIONAL - if not provided, uses defaults from context
 */
const ModificationTargetSchema = z.object({
  weekIndex: z.number().int().min(0).optional().describe('Week index (0-based). Optional - uses current view context if not specified'),
  dayIndex: z.number().int().min(0).optional().describe('Day index (0-based). Optional - uses current view context if not specified'),
  exerciseIndex: z.number().int().min(0).optional().describe('Exercise index (0-based)'),
  setgroupIndex: z.number().int().min(0).optional().describe('SetGroup index (0-based)'),
  // Alternative: use names for fuzzy matching (more robust)
  exerciseName: z.string().optional().describe('Exercise name for fuzzy matching (e.g. "squat", "panca")'),
  // For batch: target all exercises matching criteria
  allMatching: z.boolean().optional().describe('If true, applies to ALL exercises matching the name'),
});

/**
 * Strict Input Schemas for newData
 */
const SetDetailsRequiredSchema = z.object({
  reps: z.number().int().positive().describe('Reps per set. REQUIRED. For ranges like "6-8", use 6 here.'),
  repsMax: z.number().int().positive().optional().describe('Max reps for ranges. For "6-8", use 8 here.'),
  rest: z.number().int().positive().describe('Rest time in seconds. REQUIRED.'),
  intensityPercent: z.number().min(0).max(100).describe('Intensity % of 1RM. REQUIRED. For "70-80%", use 70.'),
  intensityPercentMax: z.number().min(0).max(100).optional().describe('Max intensity % for ranges. For "70-80%", use 80.'),
  rpe: z.number().min(1).max(10).optional().describe('RPE 1-10. For "RPE 7-8", use 7.'),
  rpeMax: z.number().min(1).max(10).optional().describe('Max RPE for ranges. For "RPE 7-8", use 8.'),
  weight: z.number().optional().describe('Weight in kg. For "80-100kg", use 80.'),
  weightMax: z.number().optional().describe('Max weight in kg for ranges. For "80-100kg", use 100.'),
});

const SetGroupInputSchema = z.object({
  id: z.string().optional(),
  count: z.number().int().positive().describe('Number of sets. REQUIRED.'),
  baseSet: SetDetailsRequiredSchema.describe('Details for the sets. REQUIRED. Must include reps, intensityPercent, and rest at minimum.'),
  sets: z
    .array(
      SetDetailsRequiredSchema.partial().extend({
        setNumber: z.number().int().positive().optional(),
      })
    )
    .optional(),
});

const AddExerciseInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().describe('Exercise name'),
  catalogExerciseId: z.string().optional().describe('Catalog ID if known'),
  notes: z.string().optional(),
  videoUrl: z.string().optional(),
  description: z.string().optional(),
  muscleGroups: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  category: z.string().optional(),
  typeLabel: z.string().optional(),
  repRange: z.string().optional(),
  formCues: z.array(z.string()).optional(),
  // STRICTLY REQUIRED for add_exercise
  setGroups: z
    .array(
      SetGroupInputSchema.extend({
        // Allow pre-built sets array to be passed
        sets: z
          .array(
            SetDetailsRequiredSchema.partial().extend({
              setNumber: z.number().int().positive().optional(),
            })
          )
          .optional(),
      })
    )
    .min(1)
    .describe('List of set groups. REQUIRED for add_exercise! You must define at least one set group (e.g. 3x10).'),
});

const AddSetGroupInputSchema = z.object({
  id: z.string().optional(),
  count: z.number().int().positive().optional(),
  baseSet: SetDetailsRequiredSchema.partial().optional(),
  sets: z
    .array(
      SetDetailsRequiredSchema.partial().extend({
        setNumber: z.number().int().positive().optional(),
      })
    )
    .optional(),
});

const ensureAddExercisePayload = (payload: unknown, ctx: z.RefinementCtx): void => {
  if (!payload) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['newData'],
      message: 'For add_exercise you must provide newData with setGroups, each with count and baseSet {reps, intensityPercent, rest}.',
    });
    return;
  }

  const parsed = AddExerciseInputSchema.safeParse(payload);
  if (!parsed.success) {
    parsed.error.issues.forEach((issue) => {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['newData', ...issue.path],
        message: `Invalid add_exercise payload: ${issue.message}`,
      });
    });
  }
};

/**
 * Single modification specification
 * Uses .superRefine() to ensure changes is not empty for update actions
 * and add_exercise always includes the required setGroups payload.
 */
const singleModificationSchema = z
  .object({
    action: ModificationActionSchema.describe('The type of modification to apply'),
    target: ModificationTargetSchema.describe('Where to apply the modification'),
    // Use explicit SetGroupUpdateSchema for documented, typed changes
    changes: SetGroupUpdateSchema.optional().describe(
      'The changes to apply. For update_setgroup use: sets (number), reps (number), weight (kg), intensityPercent (0-100), rest (seconds), rpe (1-10). Example for 5x5 at 80%: { "count": 5, "reps": 5, "intensityPercent": 80 }'
    ),
    newData: z
      .union([AddExerciseInputSchema, AddSetGroupInputSchema])
      .optional()
      .describe('New data to add. For add_exercise MUST include: { name: string, catalogExerciseId: string, setGroups: [{ count: number, baseSet: { reps: number, intensityPercent: number, rest: number } }] }. Example: { name: "Panca piana", catalogExerciseId: "abc123", setGroups: [{ count: 3, baseSet: { reps: 10, intensityPercent: 70, rest: 90 } }] }'),
  })
  .superRefine((data, ctx) => {
    if (data.action.startsWith('update_') && (!data.changes || Object.keys(data.changes).length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['changes'],
        message: 'For update actions, you MUST provide at least one field in changes (e.g., count, reps, weight, intensityPercent)',
      });
    }

    if (data.action === 'add_exercise') {
      ensureAddExercisePayload(data.newData, ctx);
    }
  });

const applyModificationParams = z
  .object({
    programId: z.string().describe('The ID of the program to modify'),
    // Single modification (backward compatible)
    action: ModificationActionSchema.optional().describe('The type of modification to apply'),
    target: ModificationTargetSchema.optional().describe('Where to apply the modification'),
    // Use explicit SetGroupUpdateSchema with detailed description
    changes: SetGroupUpdateSchema.optional().describe(
      'REQUIRED for update actions! For "5x5 at 80%": { "count": 5, "reps": 5, "intensityPercent": 80 }. CRITICAL: "5x5" means count=5 AND reps=5, you MUST include BOTH!'
    ),
    newData: z.union([AddExerciseInputSchema, AddSetGroupInputSchema]).optional().describe('Data for creation actions. For add_exercise, setGroups is MANDATORY.'),
    // Batch modifications: array of modifications to apply in sequence
    batch: z.array(singleModificationSchema).optional().describe('Array of modifications to apply in sequence (for batch operations)'),
  })
  .superRefine((data, ctx) => {
    if (data.batch && data.batch.length > 0) return;

    if (data.action?.startsWith('update_') && (!data.changes || Object.keys(data.changes).length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['changes'],
        message: 'For update actions, you MUST provide at least one field in changes. Valid fields: count, reps, weight, intensityPercent, rest, rpe. Example: { "count": 5, "reps": 5, "intensityPercent": 80 }',
      });
    }

    if (data.action === 'add_exercise') {
      ensureAddExercisePayload(data.newData, ctx);
    }
  });

type AddExerciseInput = z.infer<typeof AddExerciseInputSchema>;
type AddSetGroupInput = z.infer<typeof AddSetGroupInputSchema>;

const isAddExerciseInput = (payload: unknown): payload is AddExerciseInput =>
  !!payload && typeof payload === 'object' && 'setGroups' in (payload as Record<string, unknown>);

const isAddSetGroupInput = (payload: unknown): payload is AddSetGroupInput =>
  !!payload && typeof payload === 'object' && !('setGroups' in (payload as Record<string, unknown>));

type ApplyModificationParams = z.infer<typeof applyModificationParams>;

/**
 * Helper: Find exercise by name (fuzzy matching)
 */
function findExerciseByName(
  program: any,
  weekIndex: number,
  dayIndex: number,
  exerciseName: string
): { exerciseIndex: number; exercise: any } | null {
  const day = program.weeks?.[weekIndex]?.days?.[dayIndex];
  if (!day?.exercises) return null;

  const searchName = exerciseName.toLowerCase().trim();
  const exerciseIndex = day.exercises.findIndex((ex: any) =>
    ex.name?.toLowerCase().includes(searchName) ||
    ex.exerciseName?.toLowerCase().includes(searchName)
  );

  if (exerciseIndex === -1) return null;
  return { exerciseIndex, exercise: day.exercises[exerciseIndex] };
}

export const workoutApplyModificationTool: McpTool<ApplyModificationParams> = {
  name: 'workout_apply_modification',
  description: `Applies a granular modification to a workout program using DIFF-based approach.
  
EFFICIENT: You only specify WHAT to change, not the entire program.
The backend fetches the program, applies your changes, and saves.

SUPPORTED ACTIONS:
- update_setgroup: Update reps, sets, weight, intensity, rest, etc. of a specific setgroup
- add_setgroup: Add a new setgroup to an exercise
- remove_setgroup: Remove a setgroup from an exercise
- update_exercise: Update exercise properties (name, notes, technique)
- add_exercise: Add a new exercise to a day
- remove_exercise: Remove an exercise from a day

TARGETING:
- Use weekIndex/dayIndex/exerciseIndex for precise targeting
- OR use exerciseName for fuzzy matching (e.g. "squat" matches "Squat con bilanciere")

⚠️ CRITICAL: For update actions, the "changes" object MUST contain at least one field!

UNDERSTANDING "5x5" NOTATION:
The notation "5x5" means 5 sets × 5 reps each. You MUST include BOTH:
- "count": 5 → First number = number of SETS
- "reps": 5 → Second number = reps PER SET

CHANGES FIELD MAPPING (for update_setgroup):
| User Request | changes Object |
|--------------|----------------|
| "5x5 at 80%" | {"count": 5, "reps": 5, "intensityPercent": 80} | ← count AND reps!
| "3x10" | {"count": 3, "reps": 10} | ← count AND reps!
| "3 sets of 10" | {"count": 3, "reps": 10} |
| "weight 100kg" | {"weight": 100} |
| "rest 90 seconds" | {"rest": 90} |
| "RPE 8" | {"rpe": 8} |

Valid fields: count (number of sets), reps, repsMax, weight (kg), intensityPercent (0-100), intensityPercentMax, rpe (1-10), rpeMax, rest (seconds), duration (seconds)

EXAMPLE - Change squat to 5x5 at 80%:
{
  "programId": "abc-123",
  "action": "update_setgroup",
  "target": { "weekIndex": 0, "dayIndex": 0, "exerciseName": "squat", "setgroupIndex": 0 },
  "changes": { "count": 5, "reps": 5, "intensityPercent": 80 }
}`,
  parameters: applyModificationParams,
  execute: async (args, context) => {
    console.log('[MCP:workout_apply_modification] 📥 Called with:', {
      programId: args.programId,
      action: args.action,
      target: args.target,
      changes: args.changes, // Log the actual changes!
      changesKeys: args.changes ? Object.keys(args.changes) : [],
      hasBatch: !!args.batch?.length,
    });

    const { programId, batch } = args;

    // 1. Fetch current program
    const existingProgram = await prisma.workout_programs.findUnique({
      where: { id: programId },
    });

    if (!existingProgram) {
      return {
        success: false,
        error: `Program with ID ${programId} not found`,
      };
    }

    const weeks = existingProgram.weeks as unknown as any[];
    if (!weeks || weeks.length === 0) {
      return {
        success: false,
        error: 'Program has no weeks',
      };
    }

    // Get default context from workout context (passed from frontend view)
    const workoutContext = (context as any)?.workout || {};
    const defaultWeekIndex = workoutContext.defaultWeekIndex ?? 0;
    const defaultDayIndex = workoutContext.defaultDayIndex ?? 0;

    // Build list of modifications to apply (single or batch)
    const modifications = batch && batch.length > 0
      ? batch
      : args.action && args.target
        ? [{ action: args.action, target: args.target, changes: args.changes, newData: args.newData }]
        : [];

    if (modifications.length === 0) {
      return {
        success: false,
        error: 'No modification specified. Provide action+target or batch array.',
      };
    }

    const results: string[] = [];

    // Apply each modification
    for (const mod of modifications) {
      const { action, target, changes, newData } = mod;
      
      // Use defaults from context if not specified
      const weekIndex = target?.weekIndex ?? defaultWeekIndex;
      const dayIndex = target?.dayIndex ?? defaultDayIndex;
      const { exerciseIndex, setgroupIndex, exerciseName } = target || {};

      // Validate target indices
      if (weekIndex < 0 || weekIndex >= weeks.length) {
        results.push(`❌ Invalid weekIndex: ${weekIndex}. Program has ${weeks.length} weeks.`);
        continue;
      }

      const week = weeks[weekIndex];
      if (dayIndex < 0 || dayIndex >= (week.days?.length || 0)) {
        results.push(`❌ Invalid dayIndex: ${dayIndex}. Week ${weekIndex + 1} has ${week.days?.length || 0} days.`);
        continue;
      }

      const day = week.days[dayIndex];

      // Find exercise (by index or name)
      let targetExerciseIndex = exerciseIndex;
      let targetExercise: any = null;

      if (exerciseName && targetExerciseIndex === undefined) {
        const found = findExerciseByName({ weeks }, weekIndex, dayIndex, exerciseName);
        if (!found) {
          results.push(`❌ Exercise "${exerciseName}" not found in Week ${weekIndex + 1}, Day ${dayIndex + 1}`);
          continue;
        }
        targetExerciseIndex = found.exerciseIndex;
        targetExercise = found.exercise;
      } else if (targetExerciseIndex !== undefined) {
        if (targetExerciseIndex < 0 || targetExerciseIndex >= (day.exercises?.length || 0)) {
          results.push(`❌ Invalid exerciseIndex: ${targetExerciseIndex}. Day has ${day.exercises?.length || 0} exercises.`);
          continue;
        }
        targetExercise = day.exercises[targetExerciseIndex];
      }

      // Apply modification based on action
      switch (action) {
        case 'update_setgroup': {
          if (targetExercise === null || targetExerciseIndex === undefined) {
            results.push('❌ Exercise target required for update_setgroup');
            continue;
          }
          const sgIdx = setgroupIndex ?? 0;
          if (!targetExercise.setGroups || sgIdx >= targetExercise.setGroups.length) {
            results.push(`❌ SetGroup index ${sgIdx} not found. Exercise has ${targetExercise.setGroups?.length || 0} setgroups.`);
            continue;
          }
          
          // VALIDATION: Reject empty changes
          if (!changes || Object.keys(changes).length === 0) {
            console.error('[MCP:workout_apply_modification] ❌ EMPTY CHANGES REJECTED:', {
              exerciseName: targetExercise.name,
              sgIdx,
              changes,
            });
            results.push(`❌ Empty changes object for "${targetExercise.name}". You MUST specify at least one field (count, reps, weight, intensityPercent, rest, rpe).`);
            continue;
          }
          
          const originalSetGroup = { ...targetExercise.setGroups[sgIdx] };
          const currentSetGroup = targetExercise.setGroups[sgIdx];
          
          // Build the updated setGroup
          const updatedSetGroup = {
            ...currentSetGroup,
            ...changes,
          };
          
          // CRITICAL: Also update baseSet if it exists - UI reads from baseSet!
          if (currentSetGroup.baseSet) {
            // Fields that should be propagated to baseSet
            const baseSetFields = ['reps', 'repsMax', 'weight', 'weightMax', 'intensityPercent', 'intensityPercentMax', 'rpe', 'rpeMax', 'rest', 'duration'];
            const baseSetChanges: Record<string, any> = {};
            
            for (const field of baseSetFields) {
              if (changes[field as keyof typeof changes] !== undefined) {
                baseSetChanges[field] = changes[field as keyof typeof changes];
              }
            }
            
            if (Object.keys(baseSetChanges).length > 0) {
              updatedSetGroup.baseSet = {
                ...currentSetGroup.baseSet,
                ...baseSetChanges,
              };
              console.log('[MCP:workout_apply_modification] 📝 Also updating baseSet:', baseSetChanges);
            }
          }
          
          // If count changed, also update the sets array to match
          if (changes.count !== undefined && changes.count !== currentSetGroup.count) {
            const newCount = changes.count;
            const currentSets = currentSetGroup.sets || [];
            const templateSet = updatedSetGroup.baseSet || { reps: 10 };
            
            if (newCount > currentSets.length) {
              // Add sets - clone the baseSet
              const newSets = [...currentSets];
              while (newSets.length < newCount) {
                newSets.push({ ...templateSet, setNumber: newSets.length + 1 });
              }
              updatedSetGroup.sets = newSets;
            } else if (newCount < currentSets.length) {
              // Remove sets from the end
              updatedSetGroup.sets = currentSets.slice(0, newCount);
            }
            console.log('[MCP:workout_apply_modification] 📝 Adjusted sets array:', { 
              oldCount: currentSets.length, 
              newCount,
              setsArrayLength: updatedSetGroup.sets?.length 
            });
          }
          
          // CRITICAL: Propagate baseSet changes to ALL existing sets in the array
          // This ensures individual sets reflect the updated reps/intensityPercent/weight
          if (updatedSetGroup.baseSet && updatedSetGroup.sets && updatedSetGroup.sets.length > 0) {
            const baseSetFields = ['reps', 'repsMax', 'weight', 'weightMax', 'intensityPercent', 'intensityPercentMax', 'rest', 'duration'];
            const fieldsToPropagate: Record<string, any> = {};
            
            for (const field of baseSetFields) {
              if (changes[field as keyof typeof changes] !== undefined) {
                fieldsToPropagate[field] = updatedSetGroup.baseSet[field];
              }
            }
            
            if (Object.keys(fieldsToPropagate).length > 0) {
              updatedSetGroup.sets = updatedSetGroup.sets.map((set: any, idx: number) => ({
                ...set,
                ...fieldsToPropagate,
                setNumber: idx + 1,
              }));
              console.log('[MCP:workout_apply_modification] 📝 Propagated to all sets:', {
                fieldsUpdated: Object.keys(fieldsToPropagate),
                setsCount: updatedSetGroup.sets.length,
              });
            }
          }
          
          weeks[weekIndex].days[dayIndex].exercises[targetExerciseIndex].setGroups[sgIdx] = updatedSetGroup;
          
          // Log the actual changes applied
          console.log('[MCP:workout_apply_modification] 📝 Applied changes:', {
            exercise: targetExercise.name,
            sgIdx,
            before: originalSetGroup,
            changes,
            after: weeks[weekIndex].days[dayIndex].exercises[targetExerciseIndex].setGroups[sgIdx],
          });
          
          results.push(`✅ Updated setgroup ${sgIdx} of "${targetExercise.name || 'exercise'}" with: ${Object.keys(changes).join(', ')}`);
          break;
        }

        case 'add_setgroup': {
          if (targetExercise === null || targetExerciseIndex === undefined) {
            results.push('❌ Exercise target required for add_setgroup');
            continue;
          }
          const payload = isAddSetGroupInput(newData) ? newData : undefined;
          if (!weeks[weekIndex].days[dayIndex].exercises[targetExerciseIndex].setGroups) {
            weeks[weekIndex].days[dayIndex].exercises[targetExerciseIndex].setGroups = [];
          }
          
          const newSetGroup = {
            id: payload?.id || `sg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            count: payload?.count || 3,
            baseSet: {
              reps: 10,
              weight: null,
              rest: 90,
              intensityPercent: 70,
              ...(payload?.baseSet || {})
            },
            sets: payload?.sets || [],
            ...payload
          };
          
          weeks[weekIndex].days[dayIndex].exercises[targetExerciseIndex].setGroups.push(newSetGroup);
          results.push(`✅ Added setgroup to "${targetExercise.name || 'exercise'}"`);
          break;
        }

        case 'remove_setgroup': {
          if (targetExercise === null || targetExerciseIndex === undefined) {
            results.push('❌ Exercise target required for remove_setgroup');
            continue;
          }
          const sgIdx = setgroupIndex ?? 0;
          if (!targetExercise.setGroups || sgIdx >= targetExercise.setGroups.length) {
            results.push(`❌ SetGroup index ${sgIdx} not found`);
            continue;
          }
          weeks[weekIndex].days[dayIndex].exercises[targetExerciseIndex].setGroups.splice(sgIdx, 1);
          results.push(`✅ Removed setgroup ${sgIdx} from "${targetExercise.name || 'exercise'}"`);
          break;
        }

        case 'update_exercise': {
          if (targetExercise === null || targetExerciseIndex === undefined) {
            results.push('❌ Exercise target required for update_exercise');
            continue;
          }
          weeks[weekIndex].days[dayIndex].exercises[targetExerciseIndex] = {
            ...targetExercise,
            ...changes,
          };
          results.push(`✅ Updated exercise "${targetExercise.name || 'exercise'}"`);
          break;
        }

        case 'add_exercise': {
          if (!isAddExerciseInput(newData)) {
            results.push('❌ newData required for add_exercise');
            continue;
          }
          const payload = newData;
          
          // Import exercise catalog utils for fuzzy resolution
          const { resolveExerciseByName } = await import('../../utils/exercise-catalog.utils');
          
          // FUZZY RESOLUTION: If only name is provided (no catalogExerciseId), resolve it
          let exerciseName = payload.name || 'New Exercise';
          let catalogExerciseId = payload.catalogExerciseId || '';
          let muscleGroups = payload.muscleGroups || [];
          let equipment = payload.equipment || [];
          let category = payload.category || 'strength';
          
          if (!catalogExerciseId && exerciseName && exerciseName !== 'New Exercise') {
            console.log('[add_exercise] 🔍 Resolving exercise by name:', exerciseName);
            const resolved = await resolveExerciseByName(exerciseName);
            
            if (resolved) {
              catalogExerciseId = resolved.catalogExerciseId;
              exerciseName = resolved.nameIt || resolved.name; // Prefer Italian name
              muscleGroups = resolved.muscleGroups;
              equipment = resolved.equipment;
              category = resolved.category;
              console.log('[add_exercise] ✅ Resolved to:', { 
                catalogExerciseId, 
                name: exerciseName 
              });
            } else {
              console.log('[add_exercise] ⚠️ Could not resolve exercise, using provided name');
            }
          }
          
          // REQUIRE setGroups from AI - no silent fallback
          if (!payload.setGroups || payload.setGroups.length === 0) {
            results.push('❌ setGroups required for add_exercise. AI must provide [{ count, baseSet: { reps, intensityPercent, rest } }]');
            continue;
          }
          
          // Normalize setGroups - ensure required fields exist
          const rawSetGroups = payload.setGroups;
          
          // Parse repRange from payload (e.g., "6-8" -> reps: 6, repsMax: 8)
          const parseRepRange = (range: string | undefined): { reps?: number; repsMax?: number } => {
            if (!range) return {};
            const rangeMatch = range.match(/(\d+)\s*[-–]\s*(\d+)/);
            if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
              return { reps: parseInt(rangeMatch[1], 10), repsMax: parseInt(rangeMatch[2], 10) };
            }
            const singleMatch = range.match(/^(\d+)$/);
            if (singleMatch && singleMatch[1]) {
              return { reps: parseInt(singleMatch[1], 10) };
            }
            return {};
          };
          
          const exerciseRepRange = parseRepRange(payload.repRange);

          const exerciseToAdd = {
            id: payload.id || `ex_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name: exerciseName,
            description: payload.description || '',
            category,
            muscleGroups,
            setGroups: rawSetGroups.map((sg: any) => {
              // Determine reps/repsMax: prefer setGroup-level, fallback to exercise-level repRange
              const baseReps = sg.baseSet?.reps ?? exerciseRepRange.reps ?? 10;
              const baseRepsMax = sg.baseSet?.repsMax ?? exerciseRepRange.repsMax ?? null;
              
              const baseSet = {
                reps: baseReps,
                repsMax: baseRepsMax,
                weight: sg.baseSet?.weight ?? null,
                rest: sg.baseSet?.rest ?? 90,
                intensityPercent: sg.baseSet?.intensityPercent ?? 70,
                rpe: sg.baseSet?.rpe ?? null,
                ...sg.baseSet, // Allow override
                // Ensure parsed values are used if baseSet didn't explicitly set them
                ...(sg.baseSet?.reps === undefined && exerciseRepRange.reps ? { reps: exerciseRepRange.reps } : {}),
                ...(sg.baseSet?.repsMax === undefined && exerciseRepRange.repsMax ? { repsMax: exerciseRepRange.repsMax } : {}),
              };
              
              // Build individual sets if count is provided but sets array is empty
              const count = sg.count || 3;
              let sets = sg.sets && sg.sets.length > 0 ? sg.sets : [];
              if (sets.length === 0 && count > 0) {
                sets = Array.from({ length: count }, (_, i) => ({
                  setNumber: i + 1,
                  reps: baseSet.reps,
                  repsMax: baseSet.repsMax,
                  weight: baseSet.weight,
                  intensityPercent: baseSet.intensityPercent,
                  rest: baseSet.rest,
                  rpe: baseSet.rpe,
                }));
              }
              
              return {
                ...sg,
                id: sg.id || `sg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
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
            catalogExerciseId,
          };
          
          if (!weeks[weekIndex].days[dayIndex].exercises) {
            weeks[weekIndex].days[dayIndex].exercises = [];
          }
          weeks[weekIndex].days[dayIndex].exercises.push(exerciseToAdd);
          results.push(`✅ Added exercise "${exerciseToAdd.name}" to W${weekIndex + 1}D${dayIndex + 1} with ${exerciseToAdd.setGroups.length} set group(s)`);
          break;
        }

        case 'remove_exercise': {
          if (targetExerciseIndex === undefined) {
            results.push('❌ exerciseIndex or exerciseName required for remove_exercise');
            continue;
          }
          const removedName = day.exercises[targetExerciseIndex]?.name || 'exercise';
          weeks[weekIndex].days[dayIndex].exercises.splice(targetExerciseIndex, 1);
          results.push(`✅ Removed exercise "${removedName}" from W${weekIndex + 1}D${dayIndex + 1}`);
          break;
        }

        default:
          results.push(`❌ Unknown action: ${action}`);
      }
    }

    try {
      // 5. Save the modified program
      console.log('[MCP:workout_apply_modification] 💾 Saving program to database...', { programId });
      
      const updateResult = await prisma.workout_programs.update({
        where: { id: programId },
        data: {
          weeks: weeks as unknown as Prisma.InputJsonValue,
          updatedAt: new Date(),
        },
        select: { id: true, updatedAt: true } // Select only needed fields to confirm update
      });

      const message = results.join('\n');
      console.log('[MCP:workout_apply_modification] ✅ Applied & Saved:', {
        message, 
        updatedAt: updateResult.updatedAt 
      });

      const result = {
        success: true,
        message,
        programId,
        modificationsApplied: results.filter(r => r.startsWith('✅')).length,
        errors: results.filter(r => r.startsWith('❌')).length,
      };
      
      console.log('[MCP:workout_apply_modification] 📤 Returning result:', JSON.stringify(result));
      return result;

    } catch (error) {
      console.error('[MCP:workout_apply_modification] 💥 CRITICAL ERROR saving program:', error);
      return {
        success: false,
        error: `Database save failed: ${(error as Error).message}`,
        debuginfo: String(error)
      };
    }
  },
};

// =====================================================
// NOTE: I tool sono esportati singolarmente sopra.
// Non creiamo oggetti contenitori per evitare inquinamento
// del namespace MCP. Se serve un array di tool, usare
// l'import * as granularTools from './granular' e filtrare.
// =====================================================
