/**
 * Live Session Domain Configuration
 * 
 * Registers the live workout session domain with the copilot context framework.
 * 
 * @module lib-stores/copilot-context/domains
 */

import type { DomainConfig } from '../copilot-context.types';

// ============================================================================
// Context Types
// ============================================================================

export interface LiveSessionContext {
  // Resource identification
  resourceId: string; // sessionId
  programId: string;
  
  // Session status
  status: 'active' | 'paused' | 'completed';
  
  // Progress tracking
  currentExerciseIndex: number;
  currentSetIndex: number;
  completedSets: number;
  totalSets: number;
  
  // Current exercise info
  currentExerciseName: string | null;
  
  // Last completed set data
  lastSet: {
    exerciseIndex: number;
    setIndex: number;
    reps: number;
    weight: number;
    rpe?: number;
  } | null;
  
  // Rest timer
  restTimer: {
    isRunning: boolean;
    remainingSeconds: number;
  };
}

// ============================================================================
// Domain Configuration
// ============================================================================

export const liveSessionDomain: DomainConfig<unknown, LiveSessionContext> = {
  name: 'liveSession',
  
  createInitialContext: (resourceId, data): LiveSessionContext => {
    const initialData = data as { programId?: string; totalSets?: number } | undefined;
    return {
      resourceId,
      programId: initialData?.programId ?? '',
      status: 'active',
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      completedSets: 0,
      totalSets: initialData?.totalSets ?? 0,
      currentExerciseName: null,
      lastSet: null,
      restTimer: {
        isRunning: false,
        remainingSeconds: 0,
      },
    };
  },
  
  getDataFromContext: (context) => context,
  
  updateDataInContext: (context, data) => ({
    ...context,
    ...(data as Partial<LiveSessionContext>),
  }),
  
  getResourceId: (context) => context.resourceId,
};
