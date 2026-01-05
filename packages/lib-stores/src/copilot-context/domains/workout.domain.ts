/**
 * Workout Domain Configuration
 * 
 * Registers the workout domain with the copilot context framework.
 * 
 * @module lib-stores/copilot-context/domains
 */

import type { DomainConfig } from '../copilot-context.types';

// ============================================================================
// Context Types (domain-specific, but only defined here)
// ============================================================================

export interface WorkoutContextSelection {
  exercise: { index: number; id: string; name: string } | null;
  setGroup: { exerciseIndex: number; groupIndex: number } | null;
}

export interface WorkoutContext {
  // Resource identification
  resourceId: string;
  
  // Main data (the workout program)
  data: unknown; // WorkoutProgram - keep generic for framework
  
  // Navigation state
  weekIndex: number | null;
  dayIndex: number | null;
  
  // Selection state
  selection: WorkoutContextSelection;
  
  // Hover state
  hoveredElement: { type: string; indices: number[] } | null;
  
  // Clipboard for cut/copy
  clipboard: { type: string; data: unknown } | null;
}

// ============================================================================
// Domain Configuration
// ============================================================================

export const workoutDomain: DomainConfig<unknown, WorkoutContext> = {
  name: 'workout',
  
  createInitialContext: (resourceId, data): WorkoutContext => ({
    resourceId,
    data: data ?? null,
    weekIndex: null,
    dayIndex: null,
    selection: {
      exercise: null,
      setGroup: null,
    },
    hoveredElement: null,
    clipboard: null,
  }),
  
  getDataFromContext: (context) => context.data,
  
  updateDataInContext: (context, data) => ({
    ...context,
    data,
  }),
  
  getResourceId: (context) => context.resourceId,
};
