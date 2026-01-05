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
import { type UseBoundStore, type StoreApi } from 'zustand';
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
    current: T | null;
    undoStack: VersionSnapshot<T>[];
    redoStack: VersionSnapshot<T>[];
    history: VersionSnapshot<T>[];
    isInitialized: boolean;
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
}
/** Type alias for the versioning store */
export type VersioningStore<T> = UseBoundStore<StoreApi<VersioningState<T>>>;
/** Deep diff between two objects */
export declare function computeDiff<T>(oldState: T, newState: T): StateDiff;
/**
 * Creates a Zustand store with versioning capabilities
 */
export declare function createVersioningStore<T>(config: VersioningStoreConfig<T>): VersioningStore<T>;
/**
 * Hook to use versioning with automatic reactive updates
 * Convenience wrapper that extracts commonly used values
 */
export declare function useVersioningSelectors<T>(store: VersioningStore<T>): {
    state: T | null;
    setState: (update: T | ((prev: T) => T)) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    history: VersionSnapshot<T>[];
    restoreVersion: (index: number) => void;
    getDiff: (fromIndex: number, toIndex: number) => StateDiff;
    createSnapshot: (description?: string) => void;
    clearHistory: () => void;
    reset: () => void;
    initialize: (initialState: T) => void;
    isInitialized: boolean;
    hydrateHistory: (history: VersionSnapshot<T>[]) => void;
};
//# sourceMappingURL=versioning.store.d.ts.map