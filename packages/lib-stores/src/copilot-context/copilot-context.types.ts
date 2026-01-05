/**
 * Copilot Context - Types
 * 
 * Generic types for the domain-agnostic copilot context framework.
 * Following KISS/DRY/SOLID principles.
 * 
 * @module lib-stores/copilot-context
 */

// ============================================================================
// Domain Configuration
// ============================================================================

/**
 * Configuration for registering a domain with the copilot context.
 * 
 * @template TData - The main data type (e.g., WorkoutProgram, NutritionPlan)
 * @template TContext - The full context type including selections, UI state, etc.
 */
export interface DomainConfig<TData = unknown, TContext = unknown> {
  /** Unique domain name (e.g., 'workout', 'nutrition', 'oneagenda') */
  name: string;
  
  /** 
   * Factory to create initial context when domain is activated.
   * @param resourceId - The ID of the resource (e.g., programId, planId)
   * @param data - The initial data (optional, can be loaded later)
   */
  createInitialContext: (resourceId: string, data?: TData) => TContext;
  
  /**
   * How to extract the main data from the context.
   * Used for realtime sync and MCP tools.
   */
  getDataFromContext: (context: TContext) => TData | null;
  
  /**
   * How to update data within the context.
   * Returns a new context with updated data.
   */
  updateDataInContext: (context: TContext, data: TData) => TContext;
  
  /**
   * Get the resource ID from context.
   */
  getResourceId: (context: TContext) => string;
}

// ============================================================================
// Store State
// ============================================================================

/**
 * Generic state for the copilot context store.
 * No domain-specific types - fully generic.
 */
export interface CopilotContextState {
  /** Currently active domain name (or null if none) */
  activeDomain: string | null;
  
  /** 
   * Domain contexts keyed by domain name.
   * Values are typed as `unknown` - consumers cast to their domain type.
   */
  contexts: Record<string, unknown>;
  
  /** Last update timestamp for staleness checks */
  lastUpdated: number;
  
  /** 
   * Last tool modification event.
   * UI components can subscribe to trigger refresh.
   */
  lastToolModification: {
    domain: string;
    resourceId: string;
    toolName: string;
    timestamp: number;
  } | null;
}

// ============================================================================
// Store Actions
// ============================================================================

/**
 * Generic actions for the copilot context store.
 * Only 7 actions instead of 30+ domain-specific ones.
 */
export interface CopilotContextActions {
  // === Domain Lifecycle ===
  
  /** Set the active domain (switches focus) */
  setActiveDomain: (domain: string | null) => void;
  
  /** Initialize a domain context with resource ID and optional data */
  initContext: (domain: string, resourceId: string, data?: unknown) => void;
  
  /** Update the data in a domain context */
  updateData: (domain: string, data: unknown) => void;
  
  /** Patch specific fields in a domain context */
  patchContext: (domain: string, patch: Record<string, unknown>) => void;
  
  /** Clear a domain context */
  clearContext: (domain: string) => void;
  
  /** Clear all contexts */
  clearAll: () => void;
  
  // === Selectors ===
  
  /** Get context for a domain (typed by consumer) */
  getContext: <T>(domain: string) => T | null;
  
  /** Get data for a domain (typed by consumer) */
  getData: <T>(domain: string) => T | null;
  
  // === Tool Notifications ===
  
  /** Notify that a tool modified a resource */
  notifyToolModification: (domain: string, resourceId: string, toolName: string) => void;
}

/**
 * Combined store type
 */
export type CopilotContextStore = CopilotContextState & CopilotContextActions;

// ============================================================================
// Domain Registry
// ============================================================================

/**
 * Registry entry for a domain
 */
export interface DomainRegistryEntry {
  config: DomainConfig;
  registered: number; // timestamp
}

/**
 * Domain registry type
 */
export type DomainRegistry = Map<string, DomainRegistryEntry>;
