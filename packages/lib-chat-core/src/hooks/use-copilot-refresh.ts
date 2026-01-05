import { useEffect, useRef } from 'react';
import {
  useCopilotActiveContextStore,
  selectLastToolModification,
} from '@onecoach/lib-stores';

// ============================================================================
// Types
// ============================================================================

export type CopilotDomain = 'workout' | 'nutrition' | 'oneagenda';

export interface UseCopilotRefreshConfig<T> {
  /**
   * The domain this component is interested in (workout, nutrition, oneagenda)
   */
  domain: CopilotDomain;
  
  /**
   * The resource ID to watch for modifications
   * If undefined/null, the hook will not trigger refreshes
   */
  resourceId: string | undefined | null;
  
  /**
   * Function to fetch the updated data from the server
   * Should return a promise that resolves to the new data
   */
  fetchFn: () => Promise<T>;
  
  /**
   * Callback called when new data is received
   * Use this to update your local state (e.g., Zustand store)
   */
  onDataReceived: (data: T) => void;
  
  /**
   * Optional callback for error handling
   */
  onError?: (error: Error) => void;
  
  /**
   * Whether the hook is enabled (default: true)
   * Set to false to temporarily disable refresh logic
   */
  enabled?: boolean;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Generic hook for refreshing data after Copilot AI modifications.
 * 
 * This hook subscribes to the Copilot's `lastToolModification` state and
 * triggers a refetch when the chat completes for the specified domain/resource.
 * 
 * @example
 * ```tsx
 * // In a Visual Builder component
 * useCopilotRefresh({
 *   domain: 'workout',
 *   resourceId: programId,
 *   fetchFn: () => fetch(`/api/workout/${programId}`).then(r => r.json()),
 *   onDataReceived: (data) => replaceStateFromExternal(data.program),
 *   onError: (error) => toast.error('Failed to refresh'),
 * });
 * ```
 */
export function useCopilotRefresh<T>(config: UseCopilotRefreshConfig<T>): void {
  const {
    domain,
    resourceId,
    fetchFn,
    onDataReceived,
    onError,
    enabled = true,
  } = config;

  // Subscribe to modification notifications
  const lastModification = useCopilotActiveContextStore(selectLastToolModification);
  
  // Track if we're currently fetching to prevent duplicate requests
  const isFetchingRef = useRef(false);
  
  // Stable callback refs to avoid dependency issues
  const fetchFnRef = useRef(fetchFn);
  const onDataReceivedRef = useRef(onDataReceived);
  const onErrorRef = useRef(onError);
  
  // Update refs on each render
  fetchFnRef.current = fetchFn;
  onDataReceivedRef.current = onDataReceived;
  onErrorRef.current = onError;

  useEffect(() => {
    // Skip if disabled or no resource ID
    if (!enabled || !resourceId) {
      return;
    }

    // Only react to modifications for this domain and resource
    if (
      !lastModification ||
      lastModification.domain !== domain ||
      lastModification.resourceId !== resourceId
    ) {
      return;
    }

    // Prevent duplicate fetches
    if (isFetchingRef.current) {
      return;
    }

    // Perform the refresh
    const performRefresh = async () => {
      isFetchingRef.current = true;
      
      try {
        const data = await fetchFnRef.current();
        onDataReceivedRef.current(data);
      } catch (error) {
        if (onErrorRef.current) {
          onErrorRef.current(error instanceof Error ? error : new Error(String(error)));
        } else {
          console.error(`[useCopilotRefresh] Failed to refresh ${domain}:`, error);
        }
      } finally {
        isFetchingRef.current = false;
      }
    };

    performRefresh();
  }, [lastModification, domain, resourceId, enabled]);
}

// ============================================================================
// Convenience Hooks (Optional - for specific domains)
// ============================================================================

/**
 * Convenience hook specifically for workout program refresh
 */
export function useWorkoutCopilotRefresh(config: {
  programId: string | undefined | null;
  onProgramUpdated: (program: unknown) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}): void {
  useCopilotRefresh({
    domain: 'workout',
    resourceId: config.programId,
    fetchFn: async () => {
      const response = await fetch(`/api/workout/${config.programId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch workout: ${response.status}`);
      }
      const data = await response.json();
      return data.program;
    },
    onDataReceived: config.onProgramUpdated,
    onError: config.onError,
    enabled: config.enabled,
  });
}

/**
 * Convenience hook specifically for nutrition plan refresh
 */
export function useNutritionCopilotRefresh(config: {
  planId: string | undefined | null;
  onPlanUpdated: (plan: unknown) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}): void {
  useCopilotRefresh({
    domain: 'nutrition',
    resourceId: config.planId,
    fetchFn: async () => {
      const response = await fetch(`/api/nutrition/${config.planId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch nutrition plan: ${response.status}`);
      }
      const data = await response.json();
      return data.plan;
    },
    onDataReceived: config.onPlanUpdated,
    onError: config.onError,
    enabled: config.enabled,
  });
}

/**
 * Convenience hook specifically for OneAgenda project refresh
 */
export function useOneAgendaCopilotRefresh(config: {
  projectId: string | undefined | null;
  onProjectUpdated: (project: unknown) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}): void {
  useCopilotRefresh({
    domain: 'oneagenda',
    resourceId: config.projectId,
    fetchFn: async () => {
      const response = await fetch(`/api/oneagenda/${config.projectId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch project: ${response.status}`);
      }
      const data = await response.json();
      return data.project;
    },
    onDataReceived: config.onProjectUpdated,
    onError: config.onError,
    enabled: config.enabled,
  });
}
