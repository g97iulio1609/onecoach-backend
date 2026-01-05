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
import { create } from 'zustand';
import { createId } from '@paralleldrive/cuid2';
// ============================================================================
// Utility Functions
// ============================================================================
/** Create a new snapshot */
function createSnapshot(state, description) {
    return {
        id: createId(),
        state: structuredClone(state),
        timestamp: new Date(),
        description,
    };
}
/** Deep diff between two objects */
export function computeDiff(oldState, newState) {
    const added = [];
    const removed = [];
    const changed = [];
    function compare(oldVal, newVal, path) {
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
            const oldKeys = new Set(Object.keys(oldVal));
            const newKeys = new Set(Object.keys(newVal));
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
                    compare(oldVal[key], newVal[key], path ? `${path}.${key}` : key);
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
const debounceTimers = new Map();
/**
 * Creates a Zustand store with versioning capabilities
 */
export function createVersioningStore(config) {
    const { name, initialState = null, maxHistory = DEFAULT_MAX_HISTORY, debounceMs = DEFAULT_DEBOUNCE_MS, getChangeDescription, } = config;
    // Track previous state for snapshot creation
    let prevState = initialState;
    return create((set, get) => ({
        // Initial State
        current: initialState,
        undoStack: [],
        redoStack: [],
        history: [],
        isInitialized: initialState !== null,
        // Initialize with new state
        initialize: (state) => {
            set({
                current: state,
                undoStack: [],
                redoStack: [],
                history: [],
                isInitialized: true,
            });
            prevState = state;
        },
        hydrateHistory: (history) => {
            set({ history });
        },
        // Set state with immediate undo snapshot
        setState: (update) => {
            const currentState = get().current;
            if (!currentState)
                return;
            const newState = typeof update === 'function'
                ? update(currentState)
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
            debounceTimers.set(name, setTimeout(() => {
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
            }, debounceMs));
        },
        // Undo
        undo: () => {
            const { undoStack, current } = get();
            if (undoStack.length === 0 || !current)
                return;
            const [lastSnapshot, ...remainingUndo] = undoStack;
            if (!lastSnapshot)
                return;
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
            if (redoStack.length === 0 || !current)
                return;
            const [redoSnapshot, ...remainingRedo] = redoStack;
            if (!redoSnapshot)
                return;
            const currentSnapshot = createSnapshot(current, 'Before redo');
            set({
                current: redoSnapshot.state,
                undoStack: [currentSnapshot, ...get().undoStack].slice(0, maxHistory),
                redoStack: remainingRedo,
            });
        },
        // Restore to version
        restoreVersion: (index) => {
            const { history, current } = get();
            if (index < 0 || index >= history.length || !current)
                return;
            const targetSnapshot = history[index];
            if (!targetSnapshot)
                return;
            const currentSnapshot = createSnapshot(current, 'Before restore');
            set({
                current: targetSnapshot.state,
                undoStack: [currentSnapshot, ...get().undoStack].slice(0, maxHistory),
                redoStack: [],
            });
        },
        // Manual snapshot creation
        createSnapshot: (description) => {
            const { current } = get();
            if (!current)
                return;
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
        getDiff: (fromIndex, toIndex) => {
            const { current, history } = get();
            const fromState = fromIndex === -1
                ? current
                : history[fromIndex]?.state;
            const toState = toIndex === -1
                ? current
                : history[toIndex]?.state;
            if (!fromState || !toState) {
                return { added: [], removed: [], changed: [], hasChanges: false };
            }
            return computeDiff(fromState, toState);
        },
    }));
}
/**
 * Hook to use versioning with automatic reactive updates
 * Convenience wrapper that extracts commonly used values
 */
export function useVersioningSelectors(store) {
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
    };
}
