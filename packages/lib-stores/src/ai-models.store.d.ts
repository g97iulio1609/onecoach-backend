/**
 * AI Models Store
 *
 * Zustand store per gestione centralizzata dei modelli AI.
 * SSOT (Single Source of Truth) per:
 * - Lista modelli disponibili
 * - Modello selezionato
 * - Mapping ID database -> modelId API
 *
 * PRINCIPI: KISS, SOLID, DRY
 */
export interface AIModel {
    /** Database primary key (CUID) */
    id: string;
    /** Actual model identifier for API calls (e.g., 'x-ai/grok-4.1-fast') */
    modelId: string;
    /** Provider name (e.g., 'openrouter', 'anthropic') */
    provider: string;
    /** Display name for UI */
    displayName: string;
    /** Optional description */
    description?: string | null;
    /** Supports vision/images */
    supportsVision?: boolean;
    /** Supports tool calling */
    supportsTools?: boolean;
}
interface AIModelsState {
    /** Available AI models loaded from server */
    models: AIModel[];
    /** Currently selected model's database ID */
    selectedModelId: string | null;
    /** Loading state for models fetch */
    isLoading: boolean;
    /** Last error message */
    error: string | null;
}
interface AIModelsActions {
    /** Set available models (called after fetching from server) */
    setModels: (models: AIModel[]) => void;
    /** Select a model by its database ID */
    selectModel: (databaseId: string | null) => void;
    /** Set loading state */
    setLoading: (loading: boolean) => void;
    /** Set error message */
    setError: (error: string | null) => void;
    /** Reset store to initial state */
    reset: () => void;
}
type AIModelsStore = AIModelsState & AIModelsActions;
export declare const useAIModelsStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<AIModelsStore>, "setState" | "devtools"> & {
    setState(partial: AIModelsStore | Partial<AIModelsStore> | ((state: AIModelsStore) => AIModelsStore | Partial<AIModelsStore>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    setState(state: AIModelsStore | ((state: AIModelsStore) => AIModelsStore), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    devtools: {
        cleanup: () => void;
    };
}>;
/** Get all available models */
export declare const selectModels: (state: AIModelsStore) => AIModel[];
/** Get selected model's database ID */
export declare const selectSelectedModelId: (state: AIModelsStore) => string | null;
/** Get the full selected model object */
export declare const selectSelectedModel: (state: AIModelsStore) => AIModel | null;
/**
 * Get the actual model identifier for API calls.
 * This is the key selector that converts database ID to API model name.
 */
export declare const selectSelectedModelName: (state: AIModelsStore) => string | null;
/** Get the provider of the selected model */
export declare const selectSelectedProvider: (state: AIModelsStore) => string | null;
/** Check if models are loading */
export declare const selectIsLoading: (state: AIModelsStore) => boolean;
/** Get error message if any */
export declare const selectError: (state: AIModelsStore) => string | null;
/**
 * Hook to get the selected model name for API calls.
 * Use this in components that need to send the model to the API.
 */
export declare const useSelectedModelName: () => string | null;
/**
 * Hook to get the selected model object.
 */
export declare const useSelectedModel: () => AIModel | null;
/**
 * Hook to get available models.
 */
export declare const useAvailableModels: () => AIModel[];
export {};
//# sourceMappingURL=ai-models.store.d.ts.map