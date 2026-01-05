export type CopilotMode = 'chat' | 'context-aware' | 'minimized';
export type CopilotDisplayMode = 'sidebar' | 'bottom-sheet';
/**
 * Domain context types for MCP tools
 * Used to pass context without relying on URL parameters
 */
export type CopilotDomain = 'nutrition' | 'workout' | 'exercise' | 'athlete' | 'oneagenda' | 'marketplace' | 'analytics' | 'chat' | 'settings' | 'admin' | null;
/**
 * Nutrition-specific context
 */
export interface NutritionContext {
    planId: string | null;
    dayNumber: number | null;
    mealIndex: number | null;
    athleteId: string | null;
    totalDays: number | null;
}
/**
 * Workout-specific context
 */
export interface WorkoutContext {
    programId: string | null;
    sessionId: string | null;
    weekNumber: number | null;
    dayNumber: number | null;
    exerciseIndex: number | null;
    setGroupIndex: number | null;
    athleteId: string | null;
    totalWeeks: number | null;
    isLiveSession: boolean;
}
/**
 * OneAgenda-specific context
 */
export interface OneAgendaContext {
    projectId: string | null;
    taskId: string | null;
    milestoneId: string | null;
    habitId: string | null;
}
/**
 * Marketplace-specific context
 */
export interface MarketplaceContext {
    productId: string | null;
    categoryId: string | null;
    affiliateCode: string | null;
    orderId: string | null;
}
/**
 * Exercise-specific context
 */
export interface ExerciseContext {
    exerciseId: string | null;
    categoryFilter: string | null;
    muscleGroupFilter: string | null;
    searchQuery: string | null;
}
/**
 * Analytics-specific context
 */
export interface AnalyticsContext {
    athleteId: string | null;
    dateRange: {
        start: string;
        end: string;
    } | null;
    metricType: 'nutrition' | 'workout' | 'progress' | 'all' | null;
}
/**
 * Complete MCP context - passed to all tools
 */
export interface McpToolContext {
    domain: CopilotDomain;
    userId: string | null;
    athleteId: string | null;
    coachId: string | null;
    isAdmin: boolean;
    nutrition: NutritionContext;
    workout: WorkoutContext;
    exercise: ExerciseContext;
    oneAgenda: OneAgendaContext;
    marketplace: MarketplaceContext;
    analytics: AnalyticsContext;
    route: string;
    locale: string;
}
export interface CopilotFeatures {
    modelSelector: boolean;
    speechRecognition: boolean;
    attachments: boolean;
    sources: boolean;
    conversationHistory: boolean;
    contextAware: boolean;
}
export interface CopilotModel {
    id: string;
    name: string;
    provider: string;
    description?: string;
    isDefault?: boolean;
}
interface CopilotState {
    isOpen: boolean;
    toggleOpen: () => void;
    close: () => void;
    open: () => void;
    mode: CopilotMode;
    displayMode: CopilotDisplayMode;
    isExpanded: boolean;
    setMode: (mode: CopilotMode) => void;
    setDisplayMode: (mode: CopilotDisplayMode) => void;
    setExpanded: (expanded: boolean) => void;
    width: number;
    minWidth: number;
    maxWidth: number;
    isResizing: boolean;
    setWidth: (width: number) => void;
    setResizing: (resizing: boolean) => void;
    features: CopilotFeatures;
    setFeatures: (features: CopilotFeatures) => void;
    models: CopilotModel[];
    selectedModelId: string | null;
    setModels: (models: CopilotModel[]) => void;
    setSelectedModelId: (id: string) => void;
    userRole: 'admin' | 'coach' | 'athlete' | null;
    setUserRole: (role: 'admin' | 'coach' | 'athlete' | null) => void;
    currentRoute: string;
    screenContext: Record<string, unknown>;
    setCurrentRoute: (route: string) => void;
    setScreenContext: (context: Record<string, unknown>) => void;
    mcpContext: McpToolContext;
    setMcpContext: (context: Partial<McpToolContext>) => void;
    setNutritionContext: (context: Partial<NutritionContext>) => void;
    setWorkoutContext: (context: Partial<WorkoutContext>) => void;
    setExerciseContext: (context: Partial<ExerciseContext>) => void;
    setOneAgendaContext: (context: Partial<OneAgendaContext>) => void;
    setMarketplaceContext: (context: Partial<MarketplaceContext>) => void;
    setAnalyticsContext: (context: Partial<AnalyticsContext>) => void;
    setDomain: (domain: CopilotDomain) => void;
    setAthleteId: (athleteId: string | null) => void;
    clearDomainContext: () => void;
    getMcpContext: () => McpToolContext;
    initialize: (userId: string, route: string) => void;
    isInitialized: boolean;
}
export declare const useCopilotStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<CopilotState>, "setState" | "persist"> & {
    setState(partial: CopilotState | Partial<CopilotState> | ((state: CopilotState) => CopilotState | Partial<CopilotState>), replace?: false | undefined): unknown;
    setState(state: CopilotState | ((state: CopilotState) => CopilotState), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<CopilotState, {
            width: number;
            selectedModelId: string | null;
            mode: CopilotMode;
        }, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: CopilotState) => void) => () => void;
        onFinishHydration: (fn: (state: CopilotState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<CopilotState, {
            width: number;
            selectedModelId: string | null;
            mode: CopilotMode;
        }, unknown>>;
    };
}>;
export declare const selectCopilotIsOpen: (state: CopilotState) => boolean;
export declare const selectCopilotWidth: (state: CopilotState) => number;
export declare const selectCopilotFeatures: (state: CopilotState) => CopilotFeatures;
export declare const selectCopilotModels: (state: CopilotState) => CopilotModel[];
export declare const selectCopilotSelectedModel: (state: CopilotState) => CopilotModel | null;
export declare const selectCopilotDisplayMode: (state: CopilotState) => CopilotDisplayMode;
export declare const selectCopilotIsResizing: (state: CopilotState) => boolean;
export declare const selectMcpContext: (state: CopilotState) => McpToolContext;
export declare const selectCurrentDomain: (state: CopilotState) => CopilotDomain;
export declare const selectNutritionContext: (state: CopilotState) => NutritionContext;
export declare const selectWorkoutContext: (state: CopilotState) => WorkoutContext;
export declare const selectExerciseContext: (state: CopilotState) => ExerciseContext;
export declare const selectOneAgendaContext: (state: CopilotState) => OneAgendaContext;
export declare const selectMarketplaceContext: (state: CopilotState) => MarketplaceContext;
export declare const selectAnalyticsContext: (state: CopilotState) => AnalyticsContext;
export declare const selectCurrentAthleteId: (state: CopilotState) => string | null;
/**
 * Get the active context based on current domain
 */
export declare const selectActiveDomainContext: (state: CopilotState) => NutritionContext | WorkoutContext | OneAgendaContext | MarketplaceContext | ExerciseContext | AnalyticsContext | null;
export {};
//# sourceMappingURL=copilot.store.d.ts.map