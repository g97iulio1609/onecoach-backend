/**
 * Auth Store
 *
 * Centralized authentication state management using Zustand
 * Replaces AuthContext with a simpler, more performant solution
 */
/**
 * User type definition
 */
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ATHLETE' | 'COACH' | 'ADMIN' | 'SUPER_ADMIN';
    profileImage?: string;
    copilotEnabled?: boolean;
    credits?: number;
}
/**
 * Auth state interface
 */
export interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
}
/**
 * Auth actions interface
 */
export interface AuthActions {
    setUser: (user: User | null) => void;
    setTokens: (accessToken: string, refreshToken: string | undefined, expiresAt: number) => void;
    setLoading: (isLoading: boolean) => void;
    updateUser: (user: Partial<User>) => void;
    updateCredits: (credits: number) => void;
    clearAuth: () => void;
    isTokenExpired: () => boolean;
    isTokenExpiringSoon: () => boolean;
}
/**
 * Combined store type
 */
export type AuthStore = AuthState & AuthActions;
/**
 * Auth Store
 *
 * Uses Zustand with persist middleware for cross-platform storage
 * - Web: localStorage
 * - Native: AsyncStorage (via createJSONStorage)
 */
export declare const useAuthStore: import("zustand").UseBoundStore<Omit<Omit<import("zustand").StoreApi<AuthStore>, "setState" | "devtools"> & {
    setState(partial: AuthStore | Partial<AuthStore> | ((state: AuthStore) => AuthStore | Partial<AuthStore>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    setState(state: AuthStore | ((state: AuthStore) => AuthStore), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    devtools: {
        cleanup: () => void;
    };
}, "setState" | "persist"> & {
    setState(partial: AuthStore | Partial<AuthStore> | ((state: AuthStore) => AuthStore | Partial<AuthStore>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): unknown;
    setState(state: AuthStore | ((state: AuthStore) => AuthStore), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<AuthStore, unknown, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AuthStore) => void) => () => void;
        onFinishHydration: (fn: (state: AuthStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<AuthStore, unknown, unknown>>;
    };
}>;
