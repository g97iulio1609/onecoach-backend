/**
 * Workout Builder Store
 *
 * Gestisce lo stato del builder workout con UI state locale e
 * placeholder per integrazione Supabase Realtime.
 *
 * TODO: Refactor per dependency injection di supabase client e workout API
 */
import { type StoreApi, type UseBoundStore } from 'zustand';
import type { WorkoutProgram } from '@onecoach/types';
interface WorkoutBuilderState {
    activeProgram: WorkoutProgram | null;
    isLoading: boolean;
    isSaving: boolean;
    isRealtimeConnected: boolean;
    selectedWeekIndex: number;
    selectedDayIndex: number;
    viewMode: 'editor' | 'statistics' | 'progression';
    init: (programId: string) => Promise<void>;
    setProgram: (program: WorkoutProgram) => void;
    updateProgram: (updates: Partial<WorkoutProgram>) => void;
    cleanup: () => void;
    setSelectedWeek: (index: number) => void;
    setSelectedDay: (index: number) => void;
    setViewMode: (mode: 'editor' | 'statistics' | 'progression') => void;
}
export declare const useWorkoutBuilderStore: UseBoundStore<StoreApi<WorkoutBuilderState>>;
export {};
//# sourceMappingURL=workout-builder.store.d.ts.map