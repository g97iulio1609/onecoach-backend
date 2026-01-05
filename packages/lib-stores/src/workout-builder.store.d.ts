/**
 * Workout Builder Store
 *
 * Gestisce lo stato del builder workout con UI state locale e
 * integrazione Supabase Realtime.
 */
import { type StoreApi, type UseBoundStore } from 'zustand';
import type { WorkoutProgram } from '@onecoach/types';
import type { SupabaseClient } from '@supabase/supabase-js';
interface WorkoutBuilderDependencies {
    workoutApi: {
        getById: (id: string) => Promise<{
            program: WorkoutProgram;
        }>;
        update: (id: string, data: unknown) => Promise<{
            program: WorkoutProgram;
        }>;
    };
    supabase?: SupabaseClient;
}
interface WorkoutBuilderState {
    dependencies: WorkoutBuilderDependencies | null;
    activeProgram: WorkoutProgram | null;
    isLoading: boolean;
    isSaving: boolean;
    isRealtimeConnected: boolean;
    selectedWeekIndex: number;
    selectedDayIndex: number;
    viewMode: 'editor' | 'statistics' | 'progression';
    configure: (dependencies: WorkoutBuilderDependencies) => void;
    init: (programId: string) => Promise<void>;
    setProgram: (program: WorkoutProgram) => void;
    updateProgram: (updates: Partial<WorkoutProgram>) => void;
    cleanup: () => void;
    setSelectedWeek: (index: number) => void;
    setSelectedDay: (index: number) => void;
    setViewMode: (mode: 'editor' | 'statistics' | 'progression') => void;
}
export declare const useWorkoutBuilderStore: UseBoundStore<StoreApi<WorkoutBuilderState>> | any;
export {};
//# sourceMappingURL=workout-builder.store.d.ts.map