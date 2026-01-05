import { useRef } from 'react';
import {
  useCopilotActiveContextStore,
  useRealtimeSubscription,
  type CopilotActiveContextStore,
} from '@onecoach/lib-stores';

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration for domain-agnostic realtime sync with copilot context
 */
export interface UseCopilotRealtimeSyncConfig<T> {
  /**
   * Database table to subscribe to (e.g., 'workout_programs', 'nutrition_plans')
   */
  table: string;
  
  /**
   * Record ID to filter updates
   */
  recordId: string | undefined | null;
  
  /**
   * Function to fetch the full transformed data after receiving a realtime update.
   * The realtime payload only contains raw DB columns; we need the full transformed object.
   */
  fetchFn: () => Promise<T>;
  
  /**
   * Selector to update the copilot-active-context store with new data
   */
  updateStore: (store: CopilotActiveContextStore, data: T) => void;
  
  /**
   * Whether the hook is enabled (default: true)
   */
  enabled?: boolean;
}

// ============================================================================
// Core Hook - Domain Agnostic Realtime → Copilot Context Sync
// ============================================================================

/**
 * Domain-agnostic hook for syncing Supabase Realtime updates to copilot-active-context.
 * 
 * When a database record changes, this hook:
 * 1. Receives the realtime notification
 * 2. Fetches the full transformed data
 * 3. Updates the copilot-active-context store
 * 4. Sync hooks in visual builders react to the store change
 * 
 * @example
 * ```tsx
 * useCopilotRealtimeSync<WorkoutProgram>({
 *   table: 'workout_programs',
 *   recordId: programId,
 *   fetchFn: () => fetch(`/api/workout/${programId}`).then(r => r.json()).then(d => d.program),
 *   updateStore: (store, data) => store.updateWorkoutProgram(data),
 * });
 * ```
 */
export function useCopilotRealtimeSync<T>(config: UseCopilotRealtimeSyncConfig<T>): void {
  const { table, recordId, fetchFn, updateStore, enabled = true } = config;

  // Refs for stable callbacks
  const fetchFnRef = useRef(fetchFn);
  const updateStoreRef = useRef(updateStore);
  fetchFnRef.current = fetchFn;
  updateStoreRef.current = updateStore;

  // Track if we're currently fetching to avoid duplicates
  const isFetchingRef = useRef(false);

  // Subscribe to realtime updates
  useRealtimeSubscription<Record<string, unknown>>({
    table,
    filter: recordId ? `id=eq.${recordId}` : undefined,
    enabled: enabled && !!recordId,
    onUpdate: () => {
      // Debounce: skip if already fetching
      if (isFetchingRef.current) return;
      
      isFetchingRef.current = true;
      
      // Fetch full transformed data and update store
      fetchFnRef.current()
        .then((data) => {
          const store = useCopilotActiveContextStore.getState();
          updateStoreRef.current(store, data);
        })
        .catch(() => { /* Silent fail */ })
        .finally(() => {
          isFetchingRef.current = false;
        });
    },
  });
}

// ============================================================================
// Convenience Hooks - Type-safe wrappers for specific domains
// ============================================================================

/**
 * Realtime sync for workout programs → copilot-active-context.
 * 
 * When the workout_programs table updates, fetches fresh data and updates the store.
 */
export function useWorkoutCopilotRealtimeSync(config: {
  programId: string | undefined | null;
  enabled?: boolean;
}): void {
  useCopilotRealtimeSync({
    table: 'workout_programs',
    recordId: config.programId,
    enabled: config.enabled,
    fetchFn: async () => {
      const response = await fetch(`/api/workout/${config.programId}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      return data.program;
    },
    updateStore: (store, data) => store.updateWorkoutProgram(data),
  });
}

/**
 * Realtime sync for nutrition plans → copilot-active-context.
 * 
 * When the nutrition_plans table updates, fetches fresh data and updates the store.
 */
export function useNutritionCopilotRealtimeSync(config: {
  planId: string | undefined | null;
  enabled?: boolean;
}): void {
  useCopilotRealtimeSync({
    table: 'nutrition_plans',
    recordId: config.planId,
    enabled: config.enabled,
    fetchFn: async () => {
      const response = await fetch(`/api/nutrition/${config.planId}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      return data.plan;
    },
    updateStore: (store, data) => store.updateNutritionPlan(data),
  });
}

// Note: OneAgenda would need similar treatment once store supports project data
