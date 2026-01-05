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
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
// ============================================================================
// Initial State
// ============================================================================
const initialState = {
    models: [],
    selectedModelId: null,
    isLoading: false,
    error: null,
};
// ============================================================================
// Store
// ============================================================================
export const useAIModelsStore = create()(devtools((set) => ({
    ...initialState,
    setModels: (models) => set({ models, error: null }, false, 'setModels'),
    selectModel: (databaseId) => set({ selectedModelId: databaseId }, false, 'selectModel'),
    setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),
    setError: (error) => set({ error, isLoading: false }, false, 'setError'),
    reset: () => set(initialState, false, 'reset'),
}), {
    name: 'AIModelsStore',
    enabled: process.env.NODE_ENV === 'development',
}));
// ============================================================================
// Selectors (per ottimizzare re-render)
// ============================================================================
/** Get all available models */
export const selectModels = (state) => state.models;
/** Get selected model's database ID */
export const selectSelectedModelId = (state) => state.selectedModelId;
/** Get the full selected model object */
export const selectSelectedModel = (state) => {
    if (!state.selectedModelId)
        return null;
    return state.models.find((m) => m.id === state.selectedModelId) ?? null;
};
/**
 * Get the actual model identifier for API calls.
 * This is the key selector that converts database ID to API model name.
 */
export const selectSelectedModelName = (state) => {
    const model = selectSelectedModel(state);
    return model?.modelId ?? null;
};
/** Get the provider of the selected model */
export const selectSelectedProvider = (state) => {
    const model = selectSelectedModel(state);
    return model?.provider ?? null;
};
/** Check if models are loading */
export const selectIsLoading = (state) => state.isLoading;
/** Get error message if any */
export const selectError = (state) => state.error;
// ============================================================================
// Utility Hooks (convenience wrappers)
// ============================================================================
/**
 * Hook to get the selected model name for API calls.
 * Use this in components that need to send the model to the API.
 */
export const useSelectedModelName = () => useAIModelsStore(selectSelectedModelName);
/**
 * Hook to get the selected model object.
 */
export const useSelectedModel = () => useAIModelsStore(selectSelectedModel);
/**
 * Hook to get available models.
 */
export const useAvailableModels = () => useAIModelsStore(selectModels);
