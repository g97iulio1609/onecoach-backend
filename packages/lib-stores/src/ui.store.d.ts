/**
 * UI Store
 *
 * Manages global UI state (theme, modals, sidebars, etc.)
 * Replaces ThemeContext and various UI-related contexts
 *
 * Cross-platform: works on both Next.js and React Native
 */
/**
 * Theme type
 */
export type Theme = 'light' | 'dark' | 'system';
export type ActiveTheme = 'light' | 'dark';
/**
 * Theme colors interface
 */
export interface ThemeColors {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    divider: string;
    placeholder: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    overlay: string;
    shadow: string;
}
/**
 * Light theme colors
 */
export declare const lightColors: ThemeColors;
/**
 * Dark theme colors
 */
export declare const darkColors: ThemeColors;
/**
 * UI state interface
 */
export interface UIState {
    theme: Theme;
    actualTheme: ActiveTheme;
    colors: ThemeColors;
    isDark: boolean;
    sidebarOpen: boolean;
    isMobile: boolean;
    isWizardOpen: boolean;
    isChatSidebarOpen: boolean;
    mobileMenuOpen: boolean;
    copilotVisible: boolean;
}
/**
 * UI actions interface
 */
export interface UIActions {
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    setActualTheme: (theme: ActiveTheme) => void;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    setIsMobile: (isMobile: boolean) => void;
    setWizardOpen: (open: boolean) => void;
    toggleWizard: () => void;
    setChatSidebarOpen: (open: boolean) => void;
    toggleChatSidebar: () => void;
    setMobileMenuOpen: (open: boolean) => void;
    toggleMobileMenu: () => void;
    setCopilotVisible: (visible: boolean) => void;
    toggleCopilot: () => void;
}
/**
 * Combined store type
 */
export type UIStore = UIState & UIActions;
/**
 * UI Store
 *
 * Persists theme and sidebar preferences
 * Supports cross-platform storage (localStorage for web, AsyncStorage for native)
 */
export declare const useUIStore: import("zustand").UseBoundStore<Omit<Omit<import("zustand").StoreApi<UIStore>, "setState" | "devtools"> & {
    setState(partial: UIStore | Partial<UIStore> | ((state: UIStore) => UIStore | Partial<UIStore>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    setState(state: UIStore | ((state: UIStore) => UIStore), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    devtools: {
        cleanup: () => void;
    };
}, "setState" | "persist"> & {
    setState(partial: UIStore | Partial<UIStore> | ((state: UIStore) => UIStore | Partial<UIStore>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): unknown;
    setState(state: UIStore | ((state: UIStore) => UIStore), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<UIStore, unknown, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: UIStore) => void) => () => void;
        onFinishHydration: (fn: (state: UIStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<UIStore, unknown, unknown>>;
    };
}>;
export declare const useSidebar: () => {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    toggle: () => void;
};
/**
 * Theme hook
 * Returns theme state and actions
 * Compatible with both Expo and Next.js usage patterns
 */
interface ThemeSelectorSnapshot {
    theme: Theme;
    actualTheme: ActiveTheme;
    setTheme: UIStore['setTheme'];
    toggleTheme: UIStore['toggleTheme'];
    themeMode: Theme;
    setThemeMode: UIStore['setTheme'];
    isDark: boolean;
    colors: ThemeColors;
}
interface ThemeHookSnapshot extends ThemeSelectorSnapshot {
    themeObject: {
        mode: ActiveTheme;
        colors: ThemeColors;
    };
}
export declare const useTheme: () => ThemeHookSnapshot;
export declare const useWizard: () => {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    toggle: () => void;
};
/**
 * Hook to sync system theme with UI store (Web)
 * For React Native, use useSystemThemeSyncNative instead
 *
 * Usage:
 * ```tsx
 * function SystemThemeSync({ children }) {
 *   useSystemThemeSync();
 *   return <>{children}</>;
 * }
 * ```
 */
export declare function useSystemThemeSync(): void;
/**
 * Hook to sync system theme with UI store (React Native)
 * Uses useColorScheme from react-native
 *
 * Usage:
 * ```tsx
 * import { useColorScheme } from 'react-native';
 *
 * function SystemThemeSync({ children }) {
 *   useSystemThemeSyncNative(useColorScheme());
 *   return <>{children}</>;
 * }
 * ```
 */
export declare function useSystemThemeSyncNative(nativeColorScheme: 'light' | 'dark' | null | undefined): void;
export {};
//# sourceMappingURL=ui.store.d.ts.map