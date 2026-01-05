/**
 * Admin Store
 *
 * Gestisce lo stato condiviso dell'admin panel
 * Mantiene filtri, selezioni e cache durante la navigazione
 * Principi: KISS, SOLID, DRY, YAGNI
 */
/**
 * Filtri esercizi
 */
export interface ExerciseFilters {
    search: string;
    status: 'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED';
    exerciseTypeId?: string;
    equipmentIds: Set<string>;
    bodyPartIds: Set<string>;
    muscleIds: Set<string>;
    page: number;
}
/**
 * Filtri alimenti
 */
export interface FoodFilters {
    search: string;
    brandId?: string;
    categoryIds: Set<string>;
    barcode?: string;
    kcalMin?: number;
    kcalMax?: number;
    macroDominant?: 'protein' | 'carbs' | 'fats';
    minProteinPct?: number;
    minCarbPct?: number;
    minFatPct?: number;
    page: number;
}
/**
 * Stato admin
 */
export interface AdminState {
    exerciseFilters: ExerciseFilters;
    foodFilters: FoodFilters;
    selectedExerciseIds: Set<string>;
    selectedFoodIds: Set<string>;
    sidebarOpen: boolean;
    lastVisitedRoute: string | null;
    setExerciseFilters: (filters: Partial<ExerciseFilters>) => void;
    resetExerciseFilters: () => void;
    setFoodFilters: (filters: Partial<FoodFilters>) => void;
    resetFoodFilters: () => void;
    setSelectedExerciseIds: (ids: Set<string>) => void;
    toggleExerciseSelection: (id: string) => void;
    clearExerciseSelection: () => void;
    setSelectedFoodIds: (ids: Set<string>) => void;
    toggleFoodSelection: (id: string) => void;
    clearFoodSelection: () => void;
    setSidebarOpen: (open: boolean) => void;
    setLastVisitedRoute: (route: string) => void;
}
/**
 * Admin Store
 */
export declare const useAdminStore: import("zustand").UseBoundStore<Omit<Omit<import("zustand").StoreApi<AdminState>, "setState" | "devtools"> & {
    setState(partial: AdminState | Partial<AdminState> | ((state: AdminState) => AdminState | Partial<AdminState>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    setState(state: AdminState | ((state: AdminState) => AdminState), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    devtools: {
        cleanup: () => void;
    };
}, "setState" | "persist"> & {
    setState(partial: AdminState | Partial<AdminState> | ((state: AdminState) => AdminState | Partial<AdminState>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): unknown;
    setState(state: AdminState | ((state: AdminState) => AdminState), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<AdminState, {
            exerciseFilters: {
                equipmentIds: string[];
                bodyPartIds: string[];
                muscleIds: string[];
                search: string;
                status: "ALL" | "APPROVED" | "PENDING" | "REJECTED";
                exerciseTypeId?: string;
                page: number;
            };
            foodFilters: {
                categoryIds: string[];
                search: string;
                brandId?: string;
                barcode?: string;
                kcalMin?: number;
                kcalMax?: number;
                macroDominant?: "protein" | "carbs" | "fats";
                minProteinPct?: number;
                minCarbPct?: number;
                minFatPct?: number;
                page: number;
            };
            lastVisitedRoute: string | null;
        }, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AdminState) => void) => () => void;
        onFinishHydration: (fn: (state: AdminState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<AdminState, {
            exerciseFilters: {
                equipmentIds: string[];
                bodyPartIds: string[];
                muscleIds: string[];
                search: string;
                status: "ALL" | "APPROVED" | "PENDING" | "REJECTED";
                exerciseTypeId?: string;
                page: number;
            };
            foodFilters: {
                categoryIds: string[];
                search: string;
                brandId?: string;
                barcode?: string;
                kcalMin?: number;
                kcalMax?: number;
                macroDominant?: "protein" | "carbs" | "fats";
                minProteinPct?: number;
                minCarbPct?: number;
                minFatPct?: number;
                page: number;
            };
            lastVisitedRoute: string | null;
        }, unknown>>;
    };
}>;
//# sourceMappingURL=admin.store.d.ts.map