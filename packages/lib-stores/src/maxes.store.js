/**
 * Maxes Store
 *
 * Gestione centralizzata dei massimali (1RM) con Zustand.
 * I tipi sono importati da @onecoach/types per SSOT.
 *
 * FUNZIONALITÀ:
 * - CRUD completo massimali
 * - Storico versioni per ogni massimale
 * - Integrazione Realtime Supabase
 * - Selettori ottimizzati
 */
'use client';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { logger } from '@onecoach/lib-core';
// ============================================================================
// Initial State
// ============================================================================
const initialState = {
    maxes: new Map(),
    history: new Map(),
    selectedExerciseId: null,
    isHistoryModalOpen: false,
    isEditModalOpen: false,
    isLoading: false,
    isLoadingHistory: false,
    error: null,
};
// ============================================================================
// Store
// ============================================================================
export const useMaxesStore = create()(devtools((set, get) => ({
    ...initialState,
    // Data management
    setMaxes: (maxes) => {
        const maxesMap = new Map();
        maxes.forEach((max) => {
            maxesMap.set(max.exerciseId, max);
        });
        set({ maxes: maxesMap, error: null });
    },
    addMax: (max) => {
        const { maxes } = get();
        const newMaxes = new Map(maxes);
        newMaxes.set(max.exerciseId, max);
        set({ maxes: newMaxes });
    },
    updateMax: (exerciseId, data) => {
        const { maxes } = get();
        const existing = maxes.get(exerciseId);
        if (!existing)
            return;
        const newMaxes = new Map(maxes);
        newMaxes.set(exerciseId, { ...existing, ...data });
        set({ maxes: newMaxes });
    },
    removeMax: (exerciseId) => {
        const { maxes, history } = get();
        const newMaxes = new Map(maxes);
        const newHistory = new Map(history);
        newMaxes.delete(exerciseId);
        newHistory.delete(exerciseId);
        set({ maxes: newMaxes, history: newHistory });
    },
    // History
    setHistory: (exerciseId, versions) => {
        const { history } = get();
        const newHistory = new Map(history);
        newHistory.set(exerciseId, versions);
        set({ history: newHistory, isLoadingHistory: false });
    },
    clearHistory: (exerciseId) => {
        const { history } = get();
        const newHistory = new Map(history);
        newHistory.delete(exerciseId);
        set({ history: newHistory });
    },
    // UI state
    openHistoryModal: (exerciseId) => {
        set({ selectedExerciseId: exerciseId, isHistoryModalOpen: true });
    },
    closeHistoryModal: () => {
        set({ selectedExerciseId: null, isHistoryModalOpen: false });
    },
    openEditModal: (exerciseId) => {
        set({ selectedExerciseId: exerciseId ?? null, isEditModalOpen: true });
    },
    closeEditModal: () => {
        set({ selectedExerciseId: null, isEditModalOpen: false });
    },
    // Loading & error
    setLoading: (isLoading) => set({ isLoading }),
    setLoadingHistory: (isLoadingHistory) => set({ isLoadingHistory }),
    setError: (error) => set({ error, isLoading: false }),
    // Realtime handlers
    handleRealtimeInsert: (record) => {
        const { addMax } = get();
        addMax(record);
        if (process.env.NODE_ENV === 'development') {
            logger.warn('[MaxesStore] Realtime INSERT:', record.exerciseName);
        }
    },
    handleRealtimeUpdate: (record) => {
        const { updateMax } = get();
        updateMax(record.exerciseId, record);
        if (process.env.NODE_ENV === 'development') {
            logger.warn('[MaxesStore] Realtime UPDATE:', record.exerciseName);
        }
    },
    handleRealtimeDelete: (record) => {
        const { removeMax } = get();
        removeMax(record.exerciseId);
        if (process.env.NODE_ENV === 'development') {
            logger.warn('[MaxesStore] Realtime DELETE:', record.exerciseId);
        }
    },
    // Reset
    reset: () => {
        set(initialState);
    },
}), {
    name: 'MaxesStore',
    enabled: process.env.NODE_ENV === 'development',
}));
// ============================================================================
// Selectors
// ============================================================================
/** Ottieni tutti i massimali come array */
export const selectMaxesList = (state) => Array.from(state.maxes.values());
/** Ottieni massimale per exerciseId */
export const selectMaxByExerciseId = (state, exerciseId) => state.maxes.get(exerciseId);
/** Ottieni storico per exerciseId */
export const selectHistoryByExerciseId = (state, exerciseId) => state.history.get(exerciseId) ?? [];
/** Ottieni il massimale selezionato */
export const selectSelectedMax = (state) => state.selectedExerciseId ? state.maxes.get(state.selectedExerciseId) : undefined;
/** Controlla se ci sono massimali */
export const selectHasMaxes = (state) => state.maxes.size > 0;
/** Numero totale massimali */
export const selectMaxesCount = (state) => state.maxes.size;
/** Massimali ordinati per nome esercizio */
export const selectMaxesSortedByName = (state) => Array.from(state.maxes.values()).sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
/** Massimali ordinati per peso (decrescente) */
export const selectMaxesSortedByWeight = (state) => Array.from(state.maxes.values()).sort((a, b) => b.oneRepMax - a.oneRepMax);
/** Massimali ordinati per data aggiornamento (più recenti prima) */
export const selectMaxesSortedByDate = (state) => Array.from(state.maxes.values()).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
// ============================================================================
// Hooks helper
// ============================================================================
/** Hook per ottenere un massimale specifico */
export const useMax = (exerciseId) => useMaxesStore((state) => state.maxes.get(exerciseId));
/** Hook per ottenere lo storico di un massimale */
export const useMaxHistory = (exerciseId) => useMaxesStore((state) => state.history.get(exerciseId) ?? []);
/** Hook per lo stato di loading */
export const useMaxesLoading = () => useMaxesStore((state) => state.isLoading);
/** Hook per l'errore */
export const useMaxesError = () => useMaxesStore((state) => state.error);
// ============================================================================
// Debug helper
// ============================================================================
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.__MaxesStore = useMaxesStore;
}
