/**
 * Health Store
 *
 * Manages UI state for health data synchronization
 * Replaces HealthContext with Zustand store
 * Business logic (API calls, health kit operations) is in TanStack Query hooks
 */
/**
 * Health Platform type
 */
export type HealthPlatform = 'ios' | 'android';
/**
 * Health Permissions interface
 */
export interface HealthPermissions {
    steps: boolean;
    heartRate: boolean;
    activeCalories: boolean;
    weight: boolean;
    workout: boolean;
}
/**
 * Health Summary interface
 */
export interface HealthSummary {
    steps: {
        today: number;
        week: number;
        lastSync: Date | null;
    };
    heartRate: {
        latest: number | null;
        average: number | null;
        lastSync: Date | null;
    };
    activeCalories: {
        today: number;
        week: number;
        lastSync: Date | null;
    };
    weight: {
        latest: number | null;
        trend: 'up' | 'down' | 'stable' | null;
        lastSync: Date | null;
    };
    workouts: {
        count: number;
        totalMinutes: number;
        lastSync: Date | null;
    };
}
/**
 * Sync Status interface
 */
export interface SyncStatus {
    isSyncing: boolean;
    lastSyncTime: Date | null;
    syncError: string | null;
}
/**
 * Health state interface
 */
export interface HealthState {
    permissions: HealthPermissions | null;
    syncStatus: SyncStatus;
    healthSummary: HealthSummary | null;
    isAutoSyncEnabled: boolean;
    isAvailable: boolean;
    platform: HealthPlatform | null;
}
/**
 * Health actions interface
 */
export interface HealthActions {
    setPermissions: (permissions: HealthPermissions | null) => void;
    setSyncStatus: (status: SyncStatus | ((prev: SyncStatus) => SyncStatus)) => void;
    setHealthSummary: (summary: HealthSummary | null) => void;
    setIsAutoSyncEnabled: (enabled: boolean) => void;
    setIsAvailable: (available: boolean) => void;
    setPlatform: (platform: HealthPlatform) => void;
    clearSyncError: () => void;
}
/**
 * Combined store type
 */
export type HealthStore = HealthState & HealthActions;
/**
 * Health Store
 *
 * Persists auto-sync preference
 */
export declare const useHealthStore: import("zustand").UseBoundStore<Omit<Omit<import("zustand").StoreApi<HealthStore>, "setState" | "devtools"> & {
    setState(partial: HealthStore | Partial<HealthStore> | ((state: HealthStore) => HealthStore | Partial<HealthStore>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    setState(state: HealthStore | ((state: HealthStore) => HealthStore), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    devtools: {
        cleanup: () => void;
    };
}, "setState" | "persist"> & {
    setState(partial: HealthStore | Partial<HealthStore> | ((state: HealthStore) => HealthStore | Partial<HealthStore>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): unknown;
    setState(state: HealthStore | ((state: HealthStore) => HealthStore), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<HealthStore, unknown, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: HealthStore) => void) => () => void;
        onFinishHydration: (fn: (state: HealthStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<HealthStore, unknown, unknown>>;
    };
}>;
/**
 * Selector hooks for better performance
 */
export declare const useHealthPermissions: () => {
    permissions: HealthPermissions | null;
    setPermissions: (permissions: HealthPermissions | null) => void;
    hasAllPermissions: () => boolean;
};
export declare const useHealthSync: () => {
    syncStatus: SyncStatus;
    setSyncStatus: (status: SyncStatus | ((prev: SyncStatus) => SyncStatus)) => void;
    clearSyncError: () => void;
    isAutoSyncEnabled: boolean;
    setIsAutoSyncEnabled: (enabled: boolean) => void;
};
export declare const useHealthSummary: () => {
    healthSummary: HealthSummary | null;
    setHealthSummary: (summary: HealthSummary | null) => void;
};
//# sourceMappingURL=health.store.d.ts.map