/**
 * Versioning Store Factory
 *
 * Creates Zustand stores with undo/redo and version history capabilities.
 * Simplified version without immer for better TypeScript compatibility.
 *
 * @example
 * const useWorkoutVersioning = createVersioningStore<WorkoutProgram>({
 *   name: 'workout-versioning',
 *   maxHistory: 30,
 *   debounceMs: 2000,
 * });
 *
 * // In component:
 * const { state, setState, undo, redo, canUndo, canRedo, history } = useWorkoutVersioning();
 */

import { create, type UseBoundStore, type StoreApi } from 'zustand';
import { createId } from '@paralleldrive/cuid2';

// ============================================================================
// Types
// ============================================================================

/** A snapshot of state at a point in time */
export interface VersionSnapshot<T> {
  /** Unique identifier for this snapshot */
  id: string;
  /** The state at this point in time */
  state: T;
  /** When this snapshot was created */
  timestamp: Date;
  /** Optional description of what changed */
  description?: string;
}

/** Represents a change between two states */
export interface StateChange {
  /** JSON path to the changed property */
  path: string;
  /** Previous value */
  from: unknown;
  /** New value */
  to: unknown;
}

/** Diff between two versions */
export interface StateDiff {
  /** Properties that exist in new but not in old */
  added: string[];
  /** Properties that exist in old but not in new */
  removed: string[];
  /** Properties that changed value */
  changed: StateChange[];
  /** Whether there are any changes */
  hasChanges: boolean;
}

/** Configuration for the versioning store */
export interface VersioningStoreConfig<T> {
  /** Store name for debugging */
  name: string;
  /** Initial state */
  initialState?: T | null;
  /** Maximum number of versions to keep in history (default: 50) */
  maxHistory?: number;
  /** Debounce time in ms before creating a snapshot (default: 2000) */
  debounceMs?: number;
  /** Generate a description for state changes */
  getChangeDescription?: (prev: T, next: T) => string;
}

/** Versioning store state and actions */
export interface VersioningState<T> {
  // State
  current: T | null;
  undoStack: VersionSnapshot<T>[];
  redoStack: VersionSnapshot<T>[];
  history: VersionSnapshot<T>[];
  
  // UI Flags
  isInitialized: boolean;
  
  // Actions
  initialize: (initialState: T) => void;
  setState: (update: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  restoreVersion: (index: number) => void;
  createSnapshot: (description?: string) => void;
  clearHistory: () => void;
  reset: () => void;
  getDiff: (fromIndex: number, toIndex: number) => StateDiff;
  hydrateHistory: (history: VersionSnapshot<T>[]) => void;
  /** Replace state from external source (e.g., realtime sync) without creating undo/redo entries */
  replaceStateFromExternal: (newState: T) => void;
}

/** Type alias for the versioning store */
export type VersioningStore<T> = UseBoundStore<StoreApi<VersioningState<T>>>;

// ============================================================================
// Utility Functions
// ============================================================================

/** Create a new snapshot */
function createSnapshot<T>(state: T, description?: string): VersionSnapshot<T> {
  return {
    id: createId(),
    state: structuredClone(state),
    timestamp: new Date(),
    description,
  };
}

/** Deep diff between two objects */
export function computeDiff<T>(oldState: T, newState: T): StateDiff {
  const added: string[] = [];
  const removed: string[] = [];
  const changed: StateChange[] = [];

  function compare(oldVal: unknown, newVal: unknown, path: string): void {
    // Handle null/undefined
    if (oldVal === null || oldVal === undefined) {
      if (newVal !== null && newVal !== undefined) {
        added.push(path);
      }
      return;
    }
    if (newVal === null || newVal === undefined) {
      removed.push(path);
      return;
    }

    // Handle arrays
    if (Array.isArray(oldVal) && Array.isArray(newVal)) {
      const maxLen = Math.max(oldVal.length, newVal.length);
      for (let i = 0; i < maxLen; i++) {
        compare(oldVal[i], newVal[i], `${path}[${i}]`);
      }
      return;
    }

    // Handle objects
    if (typeof oldVal === 'object' && typeof newVal === 'object') {
      const oldKeys = new Set(Object.keys(oldVal as object));
      const newKeys = new Set(Object.keys(newVal as object));

      for (const key of newKeys) {
        if (!oldKeys.has(key)) {
          added.push(path ? `${path}.${key}` : key);
        }
      }

      for (const key of oldKeys) {
        if (!newKeys.has(key)) {
          removed.push(path ? `${path}.${key}` : key);
        }
      }

      for (const key of oldKeys) {
        if (newKeys.has(key)) {
          compare(
            (oldVal as Record<string, unknown>)[key],
            (newVal as Record<string, unknown>)[key],
            path ? `${path}.${key}` : key
          );
        }
      }
      return;
    }

    // Handle primitives
    if (oldVal !== newVal) {
      changed.push({ path, from: oldVal, to: newVal });
    }
  }

  compare(oldState, newState, '');

  return {
    added,
    removed,
    changed,
    hasChanges: added.length > 0 || removed.length > 0 || changed.length > 0,
  };
}

// ============================================================================
// Store Factory
// ============================================================================

const DEFAULT_MAX_HISTORY = 50;
const DEFAULT_DEBOUNCE_MS = 2000;

// Debounce timers stored outside React to persist across renders
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Creates a Zustand store with versioning capabilities
 */
export function createVersioningStore<T>(
  config: VersioningStoreConfig<T>
): VersioningStore<T> {
  const {
    name,
    initialState = null,
    maxHistory = DEFAULT_MAX_HISTORY,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    getChangeDescription,
  } = config;

  // Track previous state for snapshot creation
  let prevState: T | null = initialState;

  return create<VersioningState<T>>((set, get) => ({
    // Initial State
    current: initialState,
    undoStack: [],
    redoStack: [],
    history: [],
    isInitialized: initialState !== null,

    // Initialize with new state
    initialize: (state: T) => {
      set({
        current: state,
        undoStack: [],
        redoStack: [],
        history: [],
        isInitialized: true,
      });
      prevState = state;
    },

    hydrateHistory: (history: VersionSnapshot<T>[]) => {
      set({ history });
    },

    // Set state with immediate undo snapshot
    setState: (update: T | ((prev: T) => T)) => {
      const currentState = get().current;
      if (!currentState) return;

      const newState =
        typeof update === 'function'
          ? (update as (prev: T) => T)(currentState)
          : update;

      // Push current state to undoStack BEFORE updating (so undo restores to previous)
      const description = getChangeDescription?.(currentState, newState);
      const snapshot = createSnapshot(currentState, description);

      set({
        current: newState,
        undoStack: [snapshot, ...get().undoStack].slice(0, maxHistory),
        // Clear redo stack on new changes
        redoStack: [],
      });

      // Debounced history update (for version history modal, separate from undo)
      const existingTimer = debounceTimers.get(name);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      debounceTimers.set(
        name,
        setTimeout(() => {
          const { current } = get();
          if (current && prevState) {
            const historyDescription = getChangeDescription?.(prevState, current);
            const historySnapshot = createSnapshot(current, historyDescription);
            
            set((state) => ({
              history: [historySnapshot, ...state.history].slice(0, maxHistory),
            }));
            
            prevState = current;
          }
          debounceTimers.delete(name);
        }, debounceMs)
      );
    },

    // Undo
    undo: () => {
      const { undoStack, current } = get();
      if (undoStack.length === 0 || !current) return;

      const [lastSnapshot, ...remainingUndo] = undoStack;
      if (!lastSnapshot) return;
      
      const currentSnapshot = createSnapshot(current, 'Before undo');

      set({
        current: lastSnapshot.state,
        undoStack: remainingUndo,
        redoStack: [currentSnapshot, ...get().redoStack].slice(0, maxHistory),
      });
    },

    // Redo
    redo: () => {
      const { redoStack, current } = get();
      if (redoStack.length === 0 || !current) return;

      const [redoSnapshot, ...remainingRedo] = redoStack;
      if (!redoSnapshot) return;
      
      const currentSnapshot = createSnapshot(current, 'Before redo');

      set({
        current: redoSnapshot.state,
        undoStack: [currentSnapshot, ...get().undoStack].slice(0, maxHistory),
        redoStack: remainingRedo,
      });
    },

    // Restore to version
    restoreVersion: (index: number) => {
      const { history, current } = get();
      if (index < 0 || index >= history.length || !current) return;

      const targetSnapshot = history[index];
      if (!targetSnapshot) return;
      
      const currentSnapshot = createSnapshot(current, 'Before restore');

      set({
        current: targetSnapshot.state,
        undoStack: [currentSnapshot, ...get().undoStack].slice(0, maxHistory),
        redoStack: [],
      });
    },

    // Manual snapshot creation
    createSnapshot: (description?: string) => {
      const { current } = get();
      if (!current) return;

      const snapshot = createSnapshot(current, description);
      
      set((state) => ({
        undoStack: [snapshot, ...state.undoStack].slice(0, maxHistory),
        history: [snapshot, ...state.history].slice(0, maxHistory),
      }));
      
      prevState = current;
    },

    // Clear history
    clearHistory: () => {
      set({
        undoStack: [],
        redoStack: [],
        history: [],
      });
    },

    // Reset everything
    reset: () => {
      set({
        current: initialState,
        undoStack: [],
        redoStack: [],
        history: [],
        isInitialized: false,
      });
      prevState = initialState;
    },

    // Get diff between two versions
    getDiff: (fromIndex: number, toIndex: number): StateDiff => {
      const { current, history } = get();
      
      const fromState =
        fromIndex === -1
          ? current
          : history[fromIndex]?.state;
      const toState =
        toIndex === -1
          ? current
          : history[toIndex]?.state;

      if (!fromState || !toState) {
        return { added: [], removed: [], changed: [], hasChanges: false };
      }

      return computeDiff(fromState, toState);
    },

    // Replace state from external source (realtime sync) without creating undo/redo entries
    replaceStateFromExternal: (newState: T) => {
      set({ current: newState });
      prevState = newState;
    },
  }));
}

/**
 * Hook to use versioning with automatic reactive updates
 * Convenience wrapper that extracts commonly used values
 */
export function useVersioningSelectors<T>(
  store: VersioningStore<T>
) {
  const current = store((s) => s.current);
  const undoStack = store((s) => s.undoStack);
  const redoStack = store((s) => s.redoStack);
  const history = store((s) => s.history);
  const isInitialized = store((s) => s.isInitialized);
  
  const initialize = store((s) => s.initialize);
  const setState = store((s) => s.setState);
  const undo = store((s) => s.undo);
  const redo = store((s) => s.redo);
  const restoreVersion = store((s) => s.restoreVersion);
  const createSnapshotFn = store((s) => s.createSnapshot);
  const clearHistory = store((s) => s.clearHistory);
  const reset = store((s) => s.reset);
  const getDiff = store((s) => s.getDiff);
  const hydrateHistory = store((s) => s.hydrateHistory);
  const replaceStateFromExternal = store((s) => s.replaceStateFromExternal);

  return {
    state: current,
    setState,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    history,
    restoreVersion,
    getDiff,
    createSnapshot: createSnapshotFn,
    clearHistory,
    reset,
    initialize,
    isInitialized,
    hydrateHistory,
    replaceStateFromExternal,
  };
}
