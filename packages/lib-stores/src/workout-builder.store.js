/**
 * Workout Builder Store
 *
 * Gestisce lo stato del builder workout con UI state locale e
 * placeholder per integrazione Supabase Realtime.
 *
 * TODO: Refactor per dependency injection di supabase client e workout API
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createJSONStorage, persist } from 'zustand/middleware';
import { logger } from '@onecoach/lib-core';
export const useWorkoutBuilderStore = create()(persist(immer((set, get) => ({
    // Initial State
    activeProgram: null,
    isLoading: false,
    isSaving: false,
    isRealtimeConnected: false,
    selectedWeekIndex: 0,
    selectedDayIndex: 0,
    viewMode: 'editor',
    // Actions - TODO: Implement with proper dependency injection
    init: async (_programId) => {
        set({ isLoading: true });
        // TODO: Inject workoutApi and supabase client
        logger.warn('WorkoutBuilderStore.init: Not implemented - needs dependency injection');
        set({ isLoading: false });
    },
    cleanup: () => {
        // TODO: Implement cleanup with injected supabase client
        set({ activeProgram: null, isRealtimeConnected: false });
    },
    setProgram: (program) => {
        set({ activeProgram: program });
    },
    updateProgram: (updates) => {
        const currentProgram = get().activeProgram;
        if (!currentProgram)
            return;
        // Optimistic Update
        set((state) => {
            if (state.activeProgram) {
                Object.assign(state.activeProgram, updates);
            }
        });
        // TODO: Implement autosave with injected workoutApi
        logger.warn('WorkoutBuilderStore.updateProgram: Autosave not implemented - needs dependency injection');
    },
    // UI Actions
    setSelectedWeek: (index) => set({ selectedWeekIndex: index }),
    setSelectedDay: (index) => set({ selectedDayIndex: index }),
    setViewMode: (mode) => set({ viewMode: mode }),
})), {
    name: 'workout-builder-storage',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
        selectedWeekIndex: state.selectedWeekIndex,
        selectedDayIndex: state.selectedDayIndex,
        viewMode: state.viewMode,
    }),
}));
