/**
 * Copilot Context - React Hooks
 * 
 * Type-safe hooks for interacting with the generic copilot context.
 * 
 * @module lib-stores/copilot-context
 */

'use client';

import { useCallback } from 'react';
import { useCopilotContextStore, getDomainConfig } from './copilot-context.store';

/**
 * Hook to access and manipulate a domain's context.
 * 
 * @template TData - The main data type for the domain
 * @template TContext - The full context type (optional)
 * 
 * @example
 * ```tsx
 * const { data, context, update, patch, init, clear } = useCopilotContext<WorkoutProgram>('workout');
 * 
 * // Update the full data
 * update(newProgram);
 * 
 * // Patch specific fields
 * patch({ selectedExercise: newSelection });
 * ```
 */
export function useCopilotContext<TData = unknown, TContext = unknown>(domain: string) {
  // Selectors
  const context = useCopilotContextStore((state) => state.contexts[domain] as TContext | null);
  const activeDomain = useCopilotContextStore((state) => state.activeDomain);
  const isActive = activeDomain === domain;
  
  // Get data from context using domain config
  const config = getDomainConfig(domain);
  const data = context && config ? (config.getDataFromContext(context) as TData | null) : null;
  
  // Actions
  const initContext = useCopilotContextStore((state) => state.initContext);
  const updateData = useCopilotContextStore((state) => state.updateData);
  const patchContext = useCopilotContextStore((state) => state.patchContext);
  const clearContext = useCopilotContextStore((state) => state.clearContext);
  const setActiveDomain = useCopilotContextStore((state) => state.setActiveDomain);
  
  // Wrapped actions for this domain
  const init = useCallback(
    (resourceId: string, initialData?: TData) => {
      initContext(domain, resourceId, initialData);
    },
    [domain, initContext]
  );
  
  const update = useCallback(
    (newData: TData) => {
      updateData(domain, newData);
    },
    [domain, updateData]
  );
  
  const patch = useCallback(
    (partialContext: Partial<TContext>) => {
      patchContext(domain, partialContext as Record<string, unknown>);
    },
    [domain, patchContext]
  );
  
  const clear = useCallback(() => {
    clearContext(domain);
  }, [domain, clearContext]);
  
  const activate = useCallback(() => {
    setActiveDomain(domain);
  }, [domain, setActiveDomain]);
  
  return {
    // State
    data,
    context,
    isActive,
    
    // Actions
    init,
    update,
    patch,
    clear,
    activate,
  };
}

/**
 * Hook to subscribe to tool modifications for a domain.
 * 
 * @example
 * ```tsx
 * const lastModification = useCopilotToolNotification('workout');
 * 
 * useEffect(() => {
 *   if (lastModification) {
 *     // Refresh data
 *   }
 * }, [lastModification]);
 * ```
 */
export function useCopilotToolNotification(domain: string) {
  return useCopilotContextStore((state) => {
    if (state.lastToolModification?.domain === domain) {
      return state.lastToolModification;
    }
    return null;
  });
}

/**
 * Hook to get all registered domains.
 */
export function useRegisteredDomains() {
  // This returns from the registry, not the store
  // It's static after app startup
  return useCopilotContextStore(() => {
    // Import here to avoid circular dependency
    const { getRegisteredDomains } = require('./copilot-context.store');
    return getRegisteredDomains();
  });
}
