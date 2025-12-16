interface NavigationState {
    states: Record<string, any>;
    saveState: <T>(key: string, state: T) => void;
    getState: <T>(key: string) => T | undefined;
    clearState: (key: string) => void;
    clearAll: () => void;
}
export declare const useNavigationStateStore: import("zustand").UseBoundStore<Omit<Omit<import("zustand").StoreApi<NavigationState>, "setState" | "devtools"> & {
    setState(partial: NavigationState | Partial<NavigationState> | ((state: NavigationState) => NavigationState | Partial<NavigationState>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    setState(state: NavigationState | ((state: NavigationState) => NavigationState), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    devtools: {
        cleanup: () => void;
    };
}, "setState" | "persist"> & {
    setState(partial: NavigationState | Partial<NavigationState> | ((state: NavigationState) => NavigationState | Partial<NavigationState>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): unknown;
    setState(state: NavigationState | ((state: NavigationState) => NavigationState), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<NavigationState, unknown, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: NavigationState) => void) => () => void;
        onFinishHydration: (fn: (state: NavigationState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<NavigationState, unknown, unknown>>;
    };
}>;
export {};
//# sourceMappingURL=navigation-state.store.d.ts.map