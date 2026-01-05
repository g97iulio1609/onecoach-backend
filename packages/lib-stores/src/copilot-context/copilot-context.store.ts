/**
 * Copilot Context - Store
 * 
 * Generic, domain-agnostic store for copilot context management.
 * Domains register themselves - no hardcoding required.
 * 
 * ~150 LOC vs 800+ LOC in the old implementation.
 * 
 * @module lib-stores/copilot-context
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type {
  CopilotContextState,
  CopilotContextStore,
  DomainConfig,
  DomainRegistry,
} from './copilot-context.types';

// ============================================================================
// Domain Registry (Module-level singleton)
// ============================================================================

/** 
 * Global domain registry.
 * Domains register here on app startup.
 */
const domainRegistry: DomainRegistry = new Map();

/**
 * Register a domain with its configuration.
 * Call this once at app startup for each domain.
 * 
 * @example
 * ```ts
 * registerDomain(workoutDomain);
 * registerDomain(nutritionDomain);
 * ```
 */
export function registerDomain<TData, TContext>(
  config: DomainConfig<TData, TContext>
): void {
  if (domainRegistry.has(config.name)) {
    console.warn(`[CopilotContext] Domain "${config.name}" already registered, skipping.`);
    return;
  }
  
  domainRegistry.set(config.name, {
    config: config as DomainConfig,
    registered: Date.now(),
  });
  
  console.info(`[CopilotContext] Registered domain: ${config.name}`);
}

/**
 * Get a registered domain config.
 */
export function getDomainConfig(name: string): DomainConfig | null {
  return domainRegistry.get(name)?.config ?? null;
}

/**
 * Get all registered domain names.
 */
export function getRegisteredDomains(): string[] {
  return Array.from(domainRegistry.keys());
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: CopilotContextState = {
  activeDomain: null,
  contexts: {},
  lastUpdated: 0,
  lastToolModification: null,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useCopilotContextStore = create<CopilotContextStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // === Domain Lifecycle ===

      setActiveDomain: (domain) =>
        set(
          { activeDomain: domain, lastUpdated: Date.now() },
          false,
          'setActiveDomain'
        ),

      initContext: (domain, resourceId, data) => {
        const config = getDomainConfig(domain);
        if (!config) {
          console.error(`[CopilotContext] Domain "${domain}" not registered`);
          return;
        }

        const context = config.createInitialContext(resourceId, data);
        
        set(
          (state) => ({
            activeDomain: domain,
            contexts: { ...state.contexts, [domain]: context },
            lastUpdated: Date.now(),
          }),
          false,
          `initContext:${domain}`
        );
      },

      updateData: (domain, data) => {
        const config = getDomainConfig(domain);
        if (!config) {
          console.error(`[CopilotContext] Domain "${domain}" not registered`);
          return;
        }

        const currentContext = get().contexts[domain];
        if (!currentContext) {
          console.warn(`[CopilotContext] No context for domain "${domain}"`);
          return;
        }

        const updatedContext = config.updateDataInContext(currentContext, data);
        
        set(
          (state) => ({
            contexts: { ...state.contexts, [domain]: updatedContext },
            lastUpdated: Date.now(),
          }),
          false,
          `updateData:${domain}`
        );
      },

      patchContext: (domain, patch) => {
        const currentContext = get().contexts[domain];
        if (!currentContext || typeof currentContext !== 'object') {
          console.warn(`[CopilotContext] No context for domain "${domain}"`);
          return;
        }

        set(
          (state) => ({
            contexts: {
              ...state.contexts,
              [domain]: { ...(currentContext as object), ...patch },
            },
            lastUpdated: Date.now(),
          }),
          false,
          `patchContext:${domain}`
        );
      },

      clearContext: (domain) =>
        set(
          (state) => {
            const { [domain]: _, ...rest } = state.contexts;
            return {
              contexts: rest,
              activeDomain: state.activeDomain === domain ? null : state.activeDomain,
              lastUpdated: Date.now(),
            };
          },
          false,
          `clearContext:${domain}`
        ),

      clearAll: () =>
        set(
          { ...initialState, lastUpdated: Date.now() },
          false,
          'clearAll'
        ),

      // === Selectors ===

      getContext: <T>(domain: string): T | null => {
        return (get().contexts[domain] as T) ?? null;
      },

      getData: <T>(domain: string): T | null => {
        const config = getDomainConfig(domain);
        if (!config) return null;

        const context = get().contexts[domain];
        if (!context) return null;

        return config.getDataFromContext(context) as T;
      },

      // === Tool Notifications ===

      notifyToolModification: (domain, resourceId, toolName) =>
        set(
          {
            lastToolModification: {
              domain,
              resourceId,
              toolName,
              timestamp: Date.now(),
            },
            lastUpdated: Date.now(),
          },
          false,
          `notifyToolModification:${domain}`
        ),
    })),
    { name: 'copilot-context' }
  )
);

// ============================================================================
// Selectors
// ============================================================================

/**
 * Select the active domain name
 */
export const selectActiveDomain = (state: CopilotContextStore) => state.activeDomain;

/**
 * Select context for a specific domain
 */
export const selectContext = <T>(domain: string) => 
  (state: CopilotContextStore): T | null => state.getContext<T>(domain);

/**
 * Select data for a specific domain
 */
export const selectData = <T>(domain: string) => 
  (state: CopilotContextStore): T | null => state.getData<T>(domain);

/**
 * Select last tool modification
 */
export const selectLastToolModification = (state: CopilotContextStore) => 
  state.lastToolModification;
