/**
 * MCP Tools Index
 *
 * PRINCIPI:
 * - KISS: Export diretti senza filtri runtime
 * - SOLID (SRP): Ogni modulo tool esporta solo McpTool conformi
 * - DRY: Nessuna logica duplicata
 *
 * GARANZIA: I moduli ./food, ./exercise, ./workout esportano
 * ESCLUSIVAMENTE oggetti conformi a McpTool.
 * Non serve filtraggio perché la conformità è garantita a monte.
 */

import * as foodTools from './food';
import * as exerciseTools from './exercise';
import * as workoutTools from './workout';
import { oneagendaTools as oneagendaToolsList } from './oneagenda';
import { nutritionPlanTools } from './nutrition/plan';
import { nutritionDayMealTools } from './nutrition/day-meal';
import { nutritionTrackingTools } from './nutrition/tracking';
import { athleteTools } from './athlete';
import { marketplaceTools } from './marketplace';
import { analyticsTools } from './analytics';
import { memoryToolsRecord } from './memory';
import { profileToolsRecord } from './profile';
import * as bodyMeasurementsTools from './body-measurements';
import type { McpTool } from '../types';
import { arrayToToolRecord } from '../utils/helpers';

// Convert array to record for list-based tools using shared helper
const oneagendaToolsRecord = arrayToToolRecord(oneagendaToolsList);
const nutritionPlanToolsRecord = arrayToToolRecord(nutritionPlanTools);
const nutritionDayMealToolsRecord = arrayToToolRecord(nutritionDayMealTools);
const nutritionTrackingToolsRecord = arrayToToolRecord(nutritionTrackingTools);
const athleteToolsRecord = arrayToToolRecord(athleteTools);
const marketplaceToolsRecord = arrayToToolRecord(marketplaceTools);
const analyticsToolsRecord = arrayToToolRecord(analyticsTools);

// Convert workout array exports to record
const workoutProgramToolsRecord = workoutTools.workoutProgramTools
  ? arrayToToolRecord(workoutTools.workoutProgramTools)
  : {};

const workoutExerciseToolsRecord = workoutTools.workoutExerciseTools
  ? arrayToToolRecord(workoutTools.workoutExerciseTools)
  : {};

/**
 * Tutti i tool MCP come oggetto chiave-valore
 */
export const allTools: Record<string, McpTool> = {
  // Food domain tools
  ...(Object.fromEntries(
    Object.entries(foodTools).filter(([, v]) => typeof v === 'object' && 'execute' in v)
  ) as Record<string, McpTool>),
  // Exercise domain tools
  ...(Object.fromEntries(
    Object.entries(exerciseTools).filter(([, v]) => typeof v === 'object' && 'execute' in v)
  ) as Record<string, McpTool>),
  // Workout domain tools (legacy exports)
  ...(Object.fromEntries(
    Object.entries(workoutTools).filter(
      ([, v]) => typeof v === 'object' && 'execute' in v && !Array.isArray(v)
    )
  ) as Record<string, McpTool>),
  // Workout program generation tools
  ...workoutProgramToolsRecord,
  // Workout exercise management tools
  ...workoutExerciseToolsRecord,
  // OneAgenda domain tools
  ...oneagendaToolsRecord,
  // Nutrition plan tools
  ...nutritionPlanToolsRecord,
  // Nutrition day/meal tools
  ...nutritionDayMealToolsRecord,
  // Nutrition tracking tools
  ...nutritionTrackingToolsRecord,
  // Athlete management tools
  ...athleteToolsRecord,
  // Marketplace & Affiliate tools
  ...marketplaceToolsRecord,
  // Analytics tools
  ...analyticsToolsRecord,
  // Memory tools
  ...memoryToolsRecord,
  // Profile tools
  ...profileToolsRecord,
  // Body Measurements tools
  ...(Object.fromEntries(
    Object.entries(bodyMeasurementsTools).filter(([, v]) => typeof v === 'object' && 'execute' in v)
  ) as Record<string, McpTool>),
};

/**
 * Lista di tutti i tool MCP
 */
export const toolsList: McpTool[] = Object.values(allTools);

/**
 * Tool categories for discovery
 */
export const toolCategories = {
  food: Object.keys(foodTools).filter((k: any) => {
    const v = (foodTools as any)[k];
    return typeof v === 'object' && 'execute' in v;
  }),
  exercise: Object.keys(exerciseTools).filter((k: any) => {
    const v = (exerciseTools as any)[k];
    return typeof v === 'object' && 'execute' in v;
  }),
  workout: [
    ...Object.keys(workoutTools).filter((k: any) => {
      const v = (workoutTools as any)[k];
      return typeof v === 'object' && 'execute' in v && !Array.isArray(v);
    }),
    ...Object.keys(workoutProgramToolsRecord),
    ...Object.keys(workoutExerciseToolsRecord),
  ],
  oneagenda: oneagendaToolsList.map((t: any) => t.name),
  nutrition: [
    ...nutritionPlanTools.map((t: any) => t.name),
    ...nutritionDayMealTools.map((t: any) => t.name),
    ...nutritionTrackingTools.map((t: any) => t.name),
  ],
  athlete: athleteTools.map((t: any) => t.name),
  marketplace: marketplaceTools.map((t: any) => t.name),
  analytics: analyticsTools.map((t: any) => t.name),
};
