/**
 * Workout Builder Store
 *
 * Gestisce lo stato del builder workout con UI state locale e
 * integrazione Supabase Realtime.
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createJSONStorage, persist } from 'zustand/middleware';
import { logger } from '@onecoach/lib-core';
export const useWorkoutBuilderStore = create()(persist(immer((set, get) => ({
    // Initial State
    dependencies: null,
    activeProgram: null,
    isLoading: false,
    isSaving: false,
    isRealtimeConnected: false,
    selectedWeekIndex: 0,
    selectedDayIndex: 0,
    viewMode: 'editor',
    // Configure dependencies
    configure: (dependencies) => {
        set({ dependencies });
    },
    // Actions
    init: async (programId) => {
        const { dependencies } = get();
        if (!dependencies) {
            logger.error('WorkoutBuilderStore: Dependencies not configured. Call configure() first.');
            return;
        }
        set({ isLoading: true });
        try {
            const response = await dependencies.workoutApi.getById(programId);
            set({ activeProgram: response.program });
            // Initialize Supabase Realtime subscription if available
            if (dependencies.supabase) {
                dependencies.supabase
                    .channel(`workout-program:${programId}`)
                    .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'workout_programs',
                    filter: `id=eq.${programId}`,
                }, (payload) => {
                    // Update program when changed externally
                    const currentProgram = get().activeProgram;
                    if (currentProgram && currentProgram.id === programId) {
                        set({ activeProgram: { ...currentProgram, ...payload.new } });
                    }
                })
                    .subscribe();
                set({ isRealtimeConnected: true });
            }
        }
        catch (error) {
            logger.error('WorkoutBuilderStore.init error:', error);
        }
        finally {
            set({ isLoading: false });
        }
    },
    cleanup: () => {
        const { dependencies } = get();
        if (dependencies?.supabase) {
            // Unsubscribe from all channels
            dependencies.supabase.removeAllChannels();
        }
        set({ activeProgram: null, isRealtimeConnected: false });
    },
    setProgram: (program) => {
        set({ activeProgram: program });
    },
    updateProgram: async (updates) => {
        const currentProgram = get().activeProgram;
        if (!currentProgram)
            return;
        const { dependencies } = get();
        if (!dependencies) {
            logger.error('WorkoutBuilderStore: Dependencies not configured. Call configure() first.');
            return;
        }
        // Optimistic Update
        set((state) => {
            if (state.activeProgram) {
                Object.assign(state.activeProgram, updates);
            }
            state.isSaving = true;
        });
        // Autosave with debouncing would be handled by the caller
        try {
            const response = await dependencies.workoutApi.update(currentProgram.id, updates);
            set({ activeProgram: response.program, isSaving: false });
        }
        catch (error) {
            logger.error('WorkoutBuilderStore.updateProgram error:', error);
            // Revert optimistic update on error
            set({ activeProgram: currentProgram, isSaving: false });
        }
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
})); // forced cast to avoid complex middleware typing issues
