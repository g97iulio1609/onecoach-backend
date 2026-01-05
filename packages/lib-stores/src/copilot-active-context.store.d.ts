/**
 * Copilot Active Context Store
 *
 * Event-driven context store for AI Copilot interactions.
 * Components report their active/selected state to this store,
 * enabling context-aware AI operations.
 *
 * PRINCIPLES:
 * - Event-driven: Components report state, not URL extraction
 * - Granular: Tracks selection at all levels (program → week → day → exercise → set)
 * - Type-safe: Strong typing for all domain contexts
 * - Future-proof: Extensible for new domains
 *
 * @module lib-stores/copilot-active-context.store
 */
import type { WorkoutProgram } from '@onecoach/types';
import type { NutritionPlan } from '@onecoach/types';
/**
 * Selection state for a workout exercise
 */
export interface SelectedExercise {
    index: number;
    id: string;
    name: string;
    catalogExerciseId?: string;
}
/**
 * Selection state for a set group within an exercise
 */
export interface SelectedSetGroup {
    exerciseIndex: number;
    groupIndex: number;
}
/**
 * Hover state for UI elements
 */
export interface HoveredElement {
    type: 'exercise' | 'setGroup' | 'set' | 'day' | 'week';
    indices: number[];
}
/**
 * Workout domain active context
 */
export interface WorkoutActiveContext {
    programId: string;
    program: WorkoutProgram | null;
    weekIndex: number | null;
    dayIndex: number | null;
    selectedExercise: SelectedExercise | null;
    selectedSetGroup: SelectedSetGroup | null;
    hoveredElement: HoveredElement | null;
    clipboard: {
        type: 'exercise' | 'setGroup' | 'day';
        data: unknown;
    } | null;
}
/**
 * Selection state for a meal
 */
export interface SelectedMeal {
    index: number;
    name: string;
}
/**
 * Selection state for a food item
 */
export interface SelectedFood {
    mealIndex: number;
    foodIndex: number;
    name: string;
    foodId?: string;
}
/**
 * Nutrition domain active context
 */
export interface NutritionActiveContext {
    planId: string;
    plan: NutritionPlan | null;
    dayIndex: number | null;
    selectedMeal: SelectedMeal | null;
    selectedFood: SelectedFood | null;
    hoveredElement: HoveredElement | null;
    clipboard: {
        type: 'meal' | 'food';
        data: unknown;
    } | null;
}
/**
 * Selection state for a task
 */
export interface SelectedTask {
    id: string;
    title: string;
    parentId?: string;
}
/**
 * Selection state for a milestone
 */
export interface SelectedMilestone {
    id: string;
    title: string;
}
/**
 * OneAgenda domain active context
 */
export interface OneAgendaActiveContext {
    projectId: string;
    selectedTask: SelectedTask | null;
    selectedMilestone: SelectedMilestone | null;
    subtasks: string[];
    parallelTasks: string[];
    hoveredElement: {
        type: 'task' | 'milestone' | 'habit';
        id: string;
    } | null;
}
/**
 * Live workout session context
 * For real-time coaching during active workout sessions
 */
export interface LiveSessionContext {
    sessionId: string;
    programId: string;
    status: 'active' | 'paused' | 'completed';
    currentExerciseIndex: number;
    currentSetIndex: number;
    completedSets: number;
    totalSets: number;
    currentExerciseName: string | null;
    lastSet: {
        weight: number;
        reps: number;
        rpe: number | null;
        duration: number;
    } | null;
    restTimerRunning: boolean;
    restTimeRemaining: number;
    suggestedRestTime: number;
    sessionStartTime: number;
    elapsedTime: number;
}
/**
 * Domain type
 */
export type ActiveDomain = 'workout' | 'nutrition' | 'oneagenda' | 'liveSession' | null;
interface CopilotActiveContextState {
    domain: ActiveDomain;
    workout: WorkoutActiveContext | null;
    nutrition: NutritionActiveContext | null;
    oneAgenda: OneAgendaActiveContext | null;
    liveSession: LiveSessionContext | null;
    lastUpdated: number;
}
interface CopilotActiveContextActions {
    setDomain: (domain: ActiveDomain) => void;
    clearContext: () => void;
    initWorkoutContext: (programId: string, program: WorkoutProgram) => void;
    updateWorkoutProgram: (program: WorkoutProgram) => void;
    setWorkoutNavigation: (weekIndex: number | null, dayIndex: number | null) => void;
    selectExercise: (exercise: SelectedExercise | null) => void;
    selectSetGroup: (setGroup: SelectedSetGroup | null) => void;
    setWorkoutHover: (element: HoveredElement | null) => void;
    setWorkoutClipboard: (clipboard: WorkoutActiveContext['clipboard']) => void;
    initNutritionContext: (planId: string, plan: NutritionPlan) => void;
    updateNutritionPlan: (plan: NutritionPlan) => void;
    setNutritionNavigation: (dayIndex: number | null) => void;
    selectMeal: (meal: SelectedMeal | null) => void;
    selectFood: (food: SelectedFood | null) => void;
    setNutritionHover: (element: HoveredElement | null) => void;
    setNutritionClipboard: (clipboard: NutritionActiveContext['clipboard']) => void;
    initOneAgendaContext: (projectId: string) => void;
    selectTask: (task: SelectedTask | null) => void;
    selectMilestone: (milestone: SelectedMilestone | null) => void;
    setRelatedTasks: (subtasks: string[], parallelTasks: string[]) => void;
    initLiveSessionContext: (sessionId: string, programId: string, totalSets: number) => void;
    updateLiveSessionProgress: (exerciseIndex: number, setIndex: number, completedSets: number) => void;
    setCurrentExercise: (exerciseName: string | null, exerciseIndex: number) => void;
    recordCompletedSet: (setData: LiveSessionContext['lastSet']) => void;
    updateRestTimer: (running: boolean, remaining: number) => void;
    setLiveSessionStatus: (status: LiveSessionContext['status']) => void;
    clearLiveSession: () => void;
    getActiveContext: () => WorkoutActiveContext | NutritionActiveContext | OneAgendaActiveContext | LiveSessionContext | null;
    getWorkoutForTools: () => WorkoutProgram | null;
    getNutritionForTools: () => NutritionPlan | null;
    getLiveSessionForTools: () => LiveSessionContext | null;
}
export type CopilotActiveContextStore = CopilotActiveContextState & CopilotActiveContextActions;
export declare const useCopilotActiveContextStore: import("zustand").UseBoundStore<Omit<Omit<import("zustand").StoreApi<CopilotActiveContextStore>, "setState" | "devtools"> & {
    setState(partial: CopilotActiveContextStore | Partial<CopilotActiveContextStore> | ((state: CopilotActiveContextStore) => CopilotActiveContextStore | Partial<CopilotActiveContextStore>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    setState(state: CopilotActiveContextStore | ((state: CopilotActiveContextStore) => CopilotActiveContextStore), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    devtools: {
        cleanup: () => void;
    };
}, "subscribe"> & {
    subscribe: {
        (listener: (selectedState: CopilotActiveContextStore, previousSelectedState: CopilotActiveContextStore) => void): () => void;
        <U>(selector: (state: CopilotActiveContextStore) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: ((a: U, b: U) => boolean) | undefined;
            fireImmediately?: boolean;
        } | undefined): () => void;
    };
}>;
export declare const selectActiveDomain: (state: CopilotActiveContextStore) => ActiveDomain;
export declare const selectWorkoutContext: (state: CopilotActiveContextStore) => WorkoutActiveContext | null;
export declare const selectNutritionContext: (state: CopilotActiveContextStore) => NutritionActiveContext | null;
export declare const selectOneAgendaContext: (state: CopilotActiveContextStore) => OneAgendaActiveContext | null;
export declare const selectLiveSessionContext: (state: CopilotActiveContextStore) => LiveSessionContext | null;
export declare const selectSelectedExercise: (state: CopilotActiveContextStore) => SelectedExercise | null;
export declare const selectSelectedSetGroup: (state: CopilotActiveContextStore) => SelectedSetGroup | null;
export declare const selectSelectedMeal: (state: CopilotActiveContextStore) => SelectedMeal | null;
export declare const selectSelectedFood: (state: CopilotActiveContextStore) => SelectedFood | null;
export declare const selectSelectedTask: (state: CopilotActiveContextStore) => SelectedTask | null;
export declare const selectLiveSessionStatus: (state: CopilotActiveContextStore) => "active" | "completed" | "paused" | null;
export declare const selectLiveSessionProgress: (state: CopilotActiveContextStore) => {
    completedSets: number;
    totalSets: number;
    currentExercise: string | null;
} | null;
export declare const selectLastCompletedSet: (state: CopilotActiveContextStore) => {
    weight: number;
    reps: number;
    rpe: number | null;
    duration: number;
} | null;
export declare const selectRestTimerState: (state: CopilotActiveContextStore) => {
    running: boolean;
    remaining: number;
} | null;
/**
 * Get full active context for MCP tools
 * Includes all relevant data the AI needs
 */
export declare const selectMcpActiveContext: (state: CopilotActiveContextStore) => {
    domain: ActiveDomain;
    workout: {
        programId: string;
        program: WorkoutProgram | null;
        weekIndex: number | null;
        dayIndex: number | null;
        selectedExercise: SelectedExercise | null;
        selectedSetGroup: SelectedSetGroup | null;
    } | null;
    nutrition: {
        planId: string;
        plan: NutritionPlan | null;
        dayIndex: number | null;
        selectedMeal: SelectedMeal | null;
        selectedFood: SelectedFood | null;
    } | null;
    oneAgenda: {
        projectId: string;
        selectedTask: SelectedTask | null;
        selectedMilestone: SelectedMilestone | null;
        subtasks: string[];
        parallelTasks: string[];
    } | null;
    liveSession: {
        sessionId: string;
        programId: string;
        status: "active" | "completed" | "paused";
        currentExerciseName: string | null;
        currentExerciseIndex: number;
        currentSetIndex: number;
        completedSets: number;
        totalSets: number;
        lastSet: {
            weight: number;
            reps: number;
            rpe: number | null;
            duration: number;
        } | null;
        restTimerRunning: boolean;
        restTimeRemaining: number;
    } | null;
};
export {};
//# sourceMappingURL=copilot-active-context.store.d.ts.map