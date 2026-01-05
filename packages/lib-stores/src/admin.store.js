/**
 * Admin Store
 *
 * Gestisce lo stato condiviso dell'admin panel
 * Mantiene filtri, selezioni e cache durante la navigazione
 * Principi: KISS, SOLID, DRY, YAGNI
 */
'use client';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
const defaultExerciseFilters = {
    search: '',
    status: 'ALL',
    exerciseTypeId: undefined,
    equipmentIds: new Set(),
    bodyPartIds: new Set(),
    muscleIds: new Set(),
    page: 1,
};
const defaultFoodFilters = {
    search: '',
    brandId: undefined,
    categoryIds: new Set(),
    barcode: undefined,
    kcalMin: undefined,
    kcalMax: undefined,
    macroDominant: undefined,
    minProteinPct: undefined,
    minCarbPct: undefined,
    minFatPct: undefined,
    page: 1,
};
/**
 * Admin Store
 */
export const useAdminStore = create()(devtools(persist((set) => ({
    // Initial state
    exerciseFilters: defaultExerciseFilters,
    foodFilters: defaultFoodFilters,
    selectedExerciseIds: new Set(),
    selectedFoodIds: new Set(),
    sidebarOpen: false,
    lastVisitedRoute: null,
    // Exercise filters
    setExerciseFilters: (filters) => set((state) => ({
        exerciseFilters: { ...state.exerciseFilters, ...filters },
    })),
    resetExerciseFilters: () => set({
        exerciseFilters: defaultExerciseFilters,
        selectedExerciseIds: new Set(),
    }),
    // Food filters
    setFoodFilters: (filters) => set((state) => ({
        foodFilters: { ...state.foodFilters, ...filters },
    })),
    resetFoodFilters: () => set({
        foodFilters: defaultFoodFilters,
        selectedFoodIds: new Set(),
    }),
    // Exercise selection
    setSelectedExerciseIds: (ids) => set({ selectedExerciseIds: ids }),
    toggleExerciseSelection: (id) => set((state) => {
        const newSet = new Set(state.selectedExerciseIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        }
        else {
            newSet.add(id);
        }
        return { selectedExerciseIds: newSet };
    }),
    clearExerciseSelection: () => set({ selectedExerciseIds: new Set() }),
    // Food selection
    setSelectedFoodIds: (ids) => set({ selectedFoodIds: ids }),
    toggleFoodSelection: (id) => set((state) => {
        const newSet = new Set(state.selectedFoodIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        }
        else {
            newSet.add(id);
        }
        return { selectedFoodIds: newSet };
    }),
    clearFoodSelection: () => set({ selectedFoodIds: new Set() }),
    // UI
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setLastVisitedRoute: (route) => set({ lastVisitedRoute: route }),
}), {
    name: 'admin-storage',
    // Solo persistere filtri e route, non le selezioni
    partialize: (state) => ({
        exerciseFilters: {
            ...state.exerciseFilters,
            // Converti Set in array per serializzazione
            equipmentIds: Array.from(state.exerciseFilters.equipmentIds || []),
            bodyPartIds: Array.from(state.exerciseFilters.bodyPartIds || []),
            muscleIds: Array.from(state.exerciseFilters.muscleIds || []),
        },
        foodFilters: {
            ...state.foodFilters,
            categoryIds: Array.from(state.foodFilters.categoryIds || []),
        },
        lastVisitedRoute: state.lastVisitedRoute,
    }),
    // Deserializza array in Set
    merge: (persistedState, currentState) => {
        const ps = persistedState;
        return {
            ...currentState,
            ...ps,
            exerciseFilters: ps.exerciseFilters
                ? {
                    ...ps.exerciseFilters,
                    equipmentIds: Array.isArray(ps.exerciseFilters.equipmentIds)
                        ? new Set(ps.exerciseFilters.equipmentIds)
                        : new Set(),
                    bodyPartIds: Array.isArray(ps.exerciseFilters.bodyPartIds)
                        ? new Set(ps.exerciseFilters.bodyPartIds)
                        : new Set(),
                    muscleIds: Array.isArray(ps.exerciseFilters.muscleIds)
                        ? new Set(ps.exerciseFilters.muscleIds)
                        : new Set(),
                }
                : currentState.exerciseFilters,
            foodFilters: ps.foodFilters
                ? {
                    ...ps.foodFilters,
                    categoryIds: Array.isArray(ps.foodFilters.categoryIds)
                        ? new Set(ps.foodFilters.categoryIds)
                        : new Set(),
                }
                : currentState.foodFilters,
        };
    },
}), { name: 'AdminStore' }));
