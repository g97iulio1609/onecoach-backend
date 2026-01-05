import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// ===== Default Context Values =====
const DEFAULT_NUTRITION_CONTEXT = {
    planId: null,
    dayNumber: null,
    mealIndex: null,
    athleteId: null,
    totalDays: null,
};
const DEFAULT_WORKOUT_CONTEXT = {
    programId: null,
    sessionId: null,
    weekNumber: null,
    dayNumber: null,
    exerciseIndex: null,
    setGroupIndex: null,
    athleteId: null,
    totalWeeks: null,
    isLiveSession: false,
};
const DEFAULT_ONEAGENDA_CONTEXT = {
    projectId: null,
    taskId: null,
    milestoneId: null,
    habitId: null,
};
const DEFAULT_MARKETPLACE_CONTEXT = {
    productId: null,
    categoryId: null,
    affiliateCode: null,
    orderId: null,
};
const DEFAULT_EXERCISE_CONTEXT = {
    exerciseId: null,
    categoryFilter: null,
    muscleGroupFilter: null,
    searchQuery: null,
};
const DEFAULT_ANALYTICS_CONTEXT = {
    athleteId: null,
    dateRange: null,
    metricType: null,
};
const DEFAULT_MCP_CONTEXT = {
    domain: null,
    userId: null,
    athleteId: null,
    coachId: null,
    isAdmin: false,
    nutrition: DEFAULT_NUTRITION_CONTEXT,
    workout: DEFAULT_WORKOUT_CONTEXT,
    exercise: DEFAULT_EXERCISE_CONTEXT,
    oneAgenda: DEFAULT_ONEAGENDA_CONTEXT,
    marketplace: DEFAULT_MARKETPLACE_CONTEXT,
    analytics: DEFAULT_ANALYTICS_CONTEXT,
    route: '',
    locale: 'it',
};
// ===== Default Values =====
const DEFAULT_WIDTH = 420;
const MIN_WIDTH = 320;
const MAX_WIDTH = 600;
const DEFAULT_FEATURES = {
    modelSelector: false,
    speechRecognition: false,
    attachments: false,
    sources: false,
    conversationHistory: false,
    contextAware: true,
};
// ===== Store =====
export const useCopilotStore = create()(persist((set, get) => ({
    // Visibility
    isOpen: false,
    toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
    close: () => set({ isOpen: false }),
    open: () => set({ isOpen: true }),
    // Mode
    mode: 'chat',
    displayMode: 'sidebar',
    isExpanded: false,
    setMode: (mode) => set({ mode }),
    setDisplayMode: (displayMode) => set({ displayMode }),
    setExpanded: (isExpanded) => set({ isExpanded }),
    // Resize
    width: DEFAULT_WIDTH,
    minWidth: MIN_WIDTH,
    maxWidth: MAX_WIDTH,
    isResizing: false,
    setWidth: (width) => {
        const { minWidth, maxWidth } = get();
        const clampedWidth = Math.max(minWidth, Math.min(maxWidth, width));
        set({ width: clampedWidth });
    },
    setResizing: (isResizing) => set({ isResizing }),
    // Features
    features: DEFAULT_FEATURES,
    setFeatures: (features) => set({ features }),
    // Models
    models: [],
    selectedModelId: null,
    setModels: (models) => {
        const defaultModel = models.find((m) => m.isDefault);
        set({
            models,
            selectedModelId: defaultModel?.id || models[0]?.id || null,
        });
    },
    setSelectedModelId: (selectedModelId) => set({ selectedModelId }),
    // User role
    userRole: null,
    setUserRole: (userRole) => set({ userRole }),
    // Screen context (legacy)
    currentRoute: '',
    screenContext: {},
    setCurrentRoute: (currentRoute) => {
        set({ currentRoute });
        // Also update mcpContext route
        set((state) => ({
            mcpContext: { ...state.mcpContext, route: currentRoute },
        }));
    },
    setScreenContext: (screenContext) => set({ screenContext }),
    // MCP Tool Context
    mcpContext: DEFAULT_MCP_CONTEXT,
    setMcpContext: (context) => set((state) => ({
        mcpContext: { ...state.mcpContext, ...context },
    })),
    setNutritionContext: (context) => set((state) => ({
        mcpContext: {
            ...state.mcpContext,
            domain: 'nutrition',
            nutrition: { ...state.mcpContext.nutrition, ...context },
        },
    })),
    setWorkoutContext: (context) => set((state) => ({
        mcpContext: {
            ...state.mcpContext,
            domain: 'workout',
            workout: { ...state.mcpContext.workout, ...context },
        },
    })),
    setExerciseContext: (context) => set((state) => ({
        mcpContext: {
            ...state.mcpContext,
            domain: 'exercise',
            exercise: { ...state.mcpContext.exercise, ...context },
        },
    })),
    setOneAgendaContext: (context) => set((state) => ({
        mcpContext: {
            ...state.mcpContext,
            domain: 'oneagenda',
            oneAgenda: { ...state.mcpContext.oneAgenda, ...context },
        },
    })),
    setMarketplaceContext: (context) => set((state) => ({
        mcpContext: {
            ...state.mcpContext,
            domain: 'marketplace',
            marketplace: { ...state.mcpContext.marketplace, ...context },
        },
    })),
    setAnalyticsContext: (context) => set((state) => ({
        mcpContext: {
            ...state.mcpContext,
            domain: 'analytics',
            analytics: { ...state.mcpContext.analytics, ...context },
        },
    })),
    setDomain: (domain) => set((state) => ({
        mcpContext: { ...state.mcpContext, domain },
    })),
    setAthleteId: (athleteId) => set((state) => ({
        mcpContext: { ...state.mcpContext, athleteId },
    })),
    clearDomainContext: () => set((state) => ({
        mcpContext: {
            ...state.mcpContext,
            domain: null,
            nutrition: DEFAULT_NUTRITION_CONTEXT,
            workout: DEFAULT_WORKOUT_CONTEXT,
            exercise: DEFAULT_EXERCISE_CONTEXT,
            oneAgenda: DEFAULT_ONEAGENDA_CONTEXT,
            marketplace: DEFAULT_MARKETPLACE_CONTEXT,
            analytics: DEFAULT_ANALYTICS_CONTEXT,
        },
    })),
    getMcpContext: () => get().mcpContext,
    // Initialization
    isInitialized: false,
    initialize: (userId, route) => {
        set((state) => ({
            currentRoute: route,
            isInitialized: true,
            mcpContext: {
                ...state.mcpContext,
                userId,
                route,
            },
        }));
    },
}), {
    name: 'copilot-storage',
    partialize: (state) => ({
        width: state.width,
        selectedModelId: state.selectedModelId,
        mode: state.mode,
        // Note: mcpContext is NOT persisted to avoid stale context
    }),
}));
// ===== Selectors =====
export const selectCopilotIsOpen = (state) => state.isOpen;
export const selectCopilotWidth = (state) => state.width;
export const selectCopilotFeatures = (state) => state.features;
export const selectCopilotModels = (state) => state.models;
export const selectCopilotSelectedModel = (state) => state.models.find((m) => m.id === state.selectedModelId) || null;
export const selectCopilotDisplayMode = (state) => state.displayMode;
export const selectCopilotIsResizing = (state) => state.isResizing;
// MCP Context Selectors
export const selectMcpContext = (state) => state.mcpContext;
export const selectCurrentDomain = (state) => state.mcpContext.domain;
export const selectNutritionContext = (state) => state.mcpContext.nutrition;
export const selectWorkoutContext = (state) => state.mcpContext.workout;
export const selectExerciseContext = (state) => state.mcpContext.exercise;
export const selectOneAgendaContext = (state) => state.mcpContext.oneAgenda;
export const selectMarketplaceContext = (state) => state.mcpContext.marketplace;
export const selectAnalyticsContext = (state) => state.mcpContext.analytics;
export const selectCurrentAthleteId = (state) => state.mcpContext.athleteId;
/**
 * Get the active context based on current domain
 */
export const selectActiveDomainContext = (state) => {
    const { domain } = state.mcpContext;
    switch (domain) {
        case 'nutrition':
            return state.mcpContext.nutrition;
        case 'workout':
            return state.mcpContext.workout;
        case 'exercise':
            return state.mcpContext.exercise;
        case 'oneagenda':
            return state.mcpContext.oneAgenda;
        case 'marketplace':
            return state.mcpContext.marketplace;
        case 'analytics':
            return state.mcpContext.analytics;
        default:
            return null;
    }
};
