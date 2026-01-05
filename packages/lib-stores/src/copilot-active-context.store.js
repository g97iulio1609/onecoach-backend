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
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
// ============================================================================
// Initial State
// ============================================================================
const initialState = {
    domain: null,
    workout: null,
    nutrition: null,
    oneAgenda: null,
    liveSession: null,
    lastUpdated: 0,
};
// ============================================================================
// Store Implementation
// ============================================================================
export const useCopilotActiveContextStore = create()(devtools(subscribeWithSelector((set, get) => ({
    ...initialState,
    // === Domain Management ===
    setDomain: (domain) => set({ domain, lastUpdated: Date.now() }, false, 'setDomain'),
    clearContext: () => set({ ...initialState, lastUpdated: Date.now() }, false, 'clearContext'),
    // === Workout Actions ===
    initWorkoutContext: (programId, program) => set({
        domain: 'workout',
        workout: {
            programId,
            program,
            weekIndex: null,
            dayIndex: null,
            selectedExercise: null,
            selectedSetGroup: null,
            hoveredElement: null,
            clipboard: null,
        },
        lastUpdated: Date.now(),
    }, false, 'initWorkoutContext'),
    updateWorkoutProgram: (program) => set((state) => ({
        workout: state.workout
            ? { ...state.workout, program }
            : null,
        lastUpdated: Date.now(),
    }), false, 'updateWorkoutProgram'),
    setWorkoutNavigation: (weekIndex, dayIndex) => set((state) => ({
        workout: state.workout
            ? { ...state.workout, weekIndex, dayIndex }
            : null,
        lastUpdated: Date.now(),
    }), false, 'setWorkoutNavigation'),
    selectExercise: (exercise) => set((state) => ({
        workout: state.workout
            ? { ...state.workout, selectedExercise: exercise, selectedSetGroup: null }
            : null,
        lastUpdated: Date.now(),
    }), false, 'selectExercise'),
    selectSetGroup: (setGroup) => set((state) => ({
        workout: state.workout
            ? { ...state.workout, selectedSetGroup: setGroup }
            : null,
        lastUpdated: Date.now(),
    }), false, 'selectSetGroup'),
    setWorkoutHover: (element) => set((state) => ({
        workout: state.workout
            ? { ...state.workout, hoveredElement: element }
            : null,
    }), false, 'setWorkoutHover'),
    setWorkoutClipboard: (clipboard) => set((state) => ({
        workout: state.workout
            ? { ...state.workout, clipboard }
            : null,
        lastUpdated: Date.now(),
    }), false, 'setWorkoutClipboard'),
    // === Nutrition Actions ===
    initNutritionContext: (planId, plan) => set({
        domain: 'nutrition',
        nutrition: {
            planId,
            plan,
            dayIndex: null,
            selectedMeal: null,
            selectedFood: null,
            hoveredElement: null,
            clipboard: null,
        },
        lastUpdated: Date.now(),
    }, false, 'initNutritionContext'),
    updateNutritionPlan: (plan) => set((state) => ({
        nutrition: state.nutrition
            ? { ...state.nutrition, plan }
            : null,
        lastUpdated: Date.now(),
    }), false, 'updateNutritionPlan'),
    setNutritionNavigation: (dayIndex) => set((state) => ({
        nutrition: state.nutrition
            ? { ...state.nutrition, dayIndex }
            : null,
        lastUpdated: Date.now(),
    }), false, 'setNutritionNavigation'),
    selectMeal: (meal) => set((state) => ({
        nutrition: state.nutrition
            ? { ...state.nutrition, selectedMeal: meal, selectedFood: null }
            : null,
        lastUpdated: Date.now(),
    }), false, 'selectMeal'),
    selectFood: (food) => set((state) => ({
        nutrition: state.nutrition
            ? { ...state.nutrition, selectedFood: food }
            : null,
        lastUpdated: Date.now(),
    }), false, 'selectFood'),
    setNutritionHover: (element) => set((state) => ({
        nutrition: state.nutrition
            ? { ...state.nutrition, hoveredElement: element }
            : null,
    }), false, 'setNutritionHover'),
    setNutritionClipboard: (clipboard) => set((state) => ({
        nutrition: state.nutrition
            ? { ...state.nutrition, clipboard }
            : null,
        lastUpdated: Date.now(),
    }), false, 'setNutritionClipboard'),
    // === OneAgenda Actions ===
    initOneAgendaContext: (projectId) => set({
        domain: 'oneagenda',
        oneAgenda: {
            projectId,
            selectedTask: null,
            selectedMilestone: null,
            subtasks: [],
            parallelTasks: [],
            hoveredElement: null,
        },
        lastUpdated: Date.now(),
    }, false, 'initOneAgendaContext'),
    selectTask: (task) => set((state) => ({
        oneAgenda: state.oneAgenda
            ? { ...state.oneAgenda, selectedTask: task }
            : null,
        lastUpdated: Date.now(),
    }), false, 'selectTask'),
    selectMilestone: (milestone) => set((state) => ({
        oneAgenda: state.oneAgenda
            ? { ...state.oneAgenda, selectedMilestone: milestone }
            : null,
        lastUpdated: Date.now(),
    }), false, 'selectMilestone'),
    setRelatedTasks: (subtasks, parallelTasks) => set((state) => ({
        oneAgenda: state.oneAgenda
            ? { ...state.oneAgenda, subtasks, parallelTasks }
            : null,
        lastUpdated: Date.now(),
    }), false, 'setRelatedTasks'),
    // === Live Session Actions ===
    initLiveSessionContext: (sessionId, programId, totalSets) => {
        console.warn('[CopilotActiveContextStore] 🚀 initLiveSessionContext called', {
            sessionId,
            programId,
            totalSets,
        });
        set({
            domain: 'liveSession',
            liveSession: {
                sessionId,
                programId,
                status: 'active',
                currentExerciseIndex: 0,
                currentSetIndex: 0,
                completedSets: 0,
                totalSets,
                currentExerciseName: null,
                lastSet: null,
                restTimerRunning: false,
                restTimeRemaining: 0,
                suggestedRestTime: 90,
                sessionStartTime: Date.now(),
                elapsedTime: 0,
            },
            lastUpdated: Date.now(),
        }, false, 'initLiveSessionContext');
    },
    updateLiveSessionProgress: (exerciseIndex, setIndex, completedSets) => set((state) => ({
        liveSession: state.liveSession
            ? { ...state.liveSession, currentExerciseIndex: exerciseIndex, currentSetIndex: setIndex, completedSets }
            : null,
        lastUpdated: Date.now(),
    }), false, 'updateLiveSessionProgress'),
    setCurrentExercise: (exerciseName, exerciseIndex) => set((state) => ({
        liveSession: state.liveSession
            ? { ...state.liveSession, currentExerciseName: exerciseName, currentExerciseIndex: exerciseIndex, currentSetIndex: 0 }
            : null,
        lastUpdated: Date.now(),
    }), false, 'setCurrentExercise'),
    recordCompletedSet: (setData) => set((state) => ({
        liveSession: state.liveSession
            ? {
                ...state.liveSession,
                lastSet: setData,
                completedSets: state.liveSession.completedSets + 1,
                currentSetIndex: state.liveSession.currentSetIndex + 1,
                restTimerRunning: true,
                restTimeRemaining: state.liveSession.suggestedRestTime,
            }
            : null,
        lastUpdated: Date.now(),
    }), false, 'recordCompletedSet'),
    updateRestTimer: (running, remaining) => set((state) => ({
        liveSession: state.liveSession
            ? { ...state.liveSession, restTimerRunning: running, restTimeRemaining: remaining }
            : null,
    }), false, 'updateRestTimer'),
    setLiveSessionStatus: (status) => set((state) => ({
        liveSession: state.liveSession
            ? { ...state.liveSession, status }
            : null,
        lastUpdated: Date.now(),
    }), false, 'setLiveSessionStatus'),
    clearLiveSession: () => set({ liveSession: null, domain: null, lastUpdated: Date.now() }, false, 'clearLiveSession'),
    // === Selectors ===
    getActiveContext: () => {
        const state = get();
        switch (state.domain) {
            case 'workout':
                return state.workout;
            case 'nutrition':
                return state.nutrition;
            case 'oneagenda':
                return state.oneAgenda;
            case 'liveSession':
                return state.liveSession;
            default:
                return null;
        }
    },
    getWorkoutForTools: () => get().workout?.program ?? null,
    getNutritionForTools: () => get().nutrition?.plan ?? null,
    getLiveSessionForTools: () => get().liveSession ?? null,
})), { name: 'copilot-active-context' }));
// ============================================================================
// Selectors (for performance optimization)
// ============================================================================
export const selectActiveDomain = (state) => state.domain;
export const selectWorkoutContext = (state) => state.workout;
export const selectNutritionContext = (state) => state.nutrition;
export const selectOneAgendaContext = (state) => state.oneAgenda;
export const selectLiveSessionContext = (state) => state.liveSession;
export const selectSelectedExercise = (state) => state.workout?.selectedExercise ?? null;
export const selectSelectedSetGroup = (state) => state.workout?.selectedSetGroup ?? null;
export const selectSelectedMeal = (state) => state.nutrition?.selectedMeal ?? null;
export const selectSelectedFood = (state) => state.nutrition?.selectedFood ?? null;
export const selectSelectedTask = (state) => state.oneAgenda?.selectedTask ?? null;
// Live Session specific selectors
export const selectLiveSessionStatus = (state) => state.liveSession?.status ?? null;
export const selectLiveSessionProgress = (state) => state.liveSession ? {
    completedSets: state.liveSession.completedSets,
    totalSets: state.liveSession.totalSets,
    currentExercise: state.liveSession.currentExerciseName,
} : null;
export const selectLastCompletedSet = (state) => state.liveSession?.lastSet ?? null;
export const selectRestTimerState = (state) => state.liveSession ? {
    running: state.liveSession.restTimerRunning,
    remaining: state.liveSession.restTimeRemaining,
} : null;
/**
 * Get full active context for MCP tools
 * Includes all relevant data the AI needs
 */
export const selectMcpActiveContext = (state) => {
    const { domain, workout, nutrition, oneAgenda, liveSession } = state;
    return {
        domain,
        workout: workout ? {
            programId: workout.programId,
            program: workout.program,
            weekIndex: workout.weekIndex,
            dayIndex: workout.dayIndex,
            selectedExercise: workout.selectedExercise,
            selectedSetGroup: workout.selectedSetGroup,
        } : null,
        nutrition: nutrition ? {
            planId: nutrition.planId,
            plan: nutrition.plan,
            dayIndex: nutrition.dayIndex,
            selectedMeal: nutrition.selectedMeal,
            selectedFood: nutrition.selectedFood,
        } : null,
        oneAgenda: oneAgenda ? {
            projectId: oneAgenda.projectId,
            selectedTask: oneAgenda.selectedTask,
            selectedMilestone: oneAgenda.selectedMilestone,
            subtasks: oneAgenda.subtasks,
            parallelTasks: oneAgenda.parallelTasks,
        } : null,
        liveSession: liveSession ? {
            sessionId: liveSession.sessionId,
            programId: liveSession.programId,
            status: liveSession.status,
            currentExerciseName: liveSession.currentExerciseName,
            currentExerciseIndex: liveSession.currentExerciseIndex,
            currentSetIndex: liveSession.currentSetIndex,
            completedSets: liveSession.completedSets,
            totalSets: liveSession.totalSets,
            lastSet: liveSession.lastSet,
            restTimerRunning: liveSession.restTimerRunning,
            restTimeRemaining: liveSession.restTimeRemaining,
        } : null,
    };
};
