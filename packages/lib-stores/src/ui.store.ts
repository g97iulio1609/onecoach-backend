'use client';

/**
 * UI Store
 *
 * Manages global UI state (theme, modals, sidebars, etc.)
 * Replaces ThemeContext and various UI-related contexts
 *
 * Cross-platform: works on both Next.js and React Native
 */

import { useEffect, useMemo, useRef, useCallback, useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

/**
 * Theme type
 */
export type Theme = 'light' | 'dark' | 'system';
export type ActiveTheme = 'light' | 'dark';

/**
 * Theme colors interface
 */
export interface ThemeColors {
  // Primary
  primary: string;
  primaryDark: string;
  primaryLight: string;

  // Background
  background: string;
  surface: string;
  card: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;

  // UI Elements
  border: string;
  divider: string;
  placeholder: string;

  // Status
  success: string;
  warning: string;
  error: string;
  info: string;

  // Special
  overlay: string;
  shadow: string;
}

/**
 * Light theme colors
 */
export const lightColors: ThemeColors = {
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  primaryLight: '#60A5FA',

  background: '#F9FAFB',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',

  border: '#E5E7EB',
  divider: '#F3F4F6',
  placeholder: '#D1D5DB',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

/**
 * Dark theme colors
 */
export const darkColors: ThemeColors = {
  primary: '#3B82F6',
  primaryDark: '#60A5FA',
  primaryLight: '#2563EB',

  background: '#111827',
  surface: '#1F2937',
  card: '#374151',

  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',

  border: '#4B5563',
  divider: '#374151',
  placeholder: '#6B7280',

  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',

  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

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
 * Get colors for a theme
 */
function getColorsForTheme(theme: ActiveTheme): ThemeColors {
  return theme === 'dark' ? darkColors : lightColors;
}

/**
 * Initial state
 */
const getInitialState = (): UIState => {
  const initialTheme: Theme = 'system';
  const initialActualTheme: ActiveTheme = 'light'; // Will be updated on mount
  return {
    theme: initialTheme,
    actualTheme: initialActualTheme,
    colors: getColorsForTheme(initialActualTheme),
    isDark: false,
    sidebarOpen: true,
    isMobile: false,
    isWizardOpen: false,
    isChatSidebarOpen: true,
    mobileMenuOpen: false,
    copilotVisible: false,
  };
};

/**
 * UI Store
 *
 * Persists theme and sidebar preferences
 * Supports cross-platform storage (localStorage for web, AsyncStorage for native)
 */
export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...getInitialState(),

        setTheme: (theme) => {
          let newActualTheme: ActiveTheme;

          if (theme === 'system') {
            // For system theme, detect current system preference
            if (typeof window !== 'undefined') {
              newActualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
            } else {
              // Default to light if we can't detect (will be updated by platform code)
              newActualTheme = get().actualTheme || 'light';
            }
          } else {
            newActualTheme = theme;
          }

          const newColors = getColorsForTheme(newActualTheme);

          set({
            theme,
            actualTheme: newActualTheme,
            colors: newColors,
            isDark: newActualTheme === 'dark',
          });

          // Update DOM class on web
          if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(newActualTheme);

            // Update theme-color meta tag
            const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
            if (themeColorMetaTag) {
              themeColorMetaTag.setAttribute(
                'content',
                newActualTheme === 'dark' ? '#0f172a' : '#ffffff'
              );
            }
          }
        },

        setActualTheme: (actualTheme) => {
          const colors = getColorsForTheme(actualTheme);
          set({
            actualTheme,
            colors,
            isDark: actualTheme === 'dark',
          });

          // Update DOM class on web
          if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(actualTheme);
          }
        },

        toggleTheme: () => {
          const state = get();
          const newTheme: Theme = state.actualTheme === 'light' ? 'dark' : 'light';
          get().setTheme(newTheme);
        },

        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

        toggleSidebar: () =>
          set((state) => ({
            sidebarOpen: !state.sidebarOpen,
          })),

        setIsMobile: (isMobile) => set({ isMobile }),

        setWizardOpen: (isWizardOpen) => set({ isWizardOpen }),

        toggleWizard: () =>
          set((state) => ({
            isWizardOpen: !state.isWizardOpen,
          })),

        setChatSidebarOpen: (isChatSidebarOpen) => set({ isChatSidebarOpen }),

        toggleChatSidebar: () =>
          set((state) => ({
            isChatSidebarOpen: !state.isChatSidebarOpen,
          })),

        setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),

        toggleMobileMenu: () =>
          set((state) => ({
            mobileMenuOpen: !state.mobileMenuOpen,
          })),

        setCopilotVisible: (copilotVisible) => set({ copilotVisible }),

        toggleCopilot: () =>
          set((state) => ({
            copilotVisible: !state.copilotVisible,
          })),
      }),
      {
        name: 'ui-storage',
        storage: createJSONStorage(() => {
          if (typeof window !== 'undefined') {
            return localStorage;
          }
          // For React Native, this will be replaced by AsyncStorage in the app
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }),
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          isChatSidebarOpen: state.isChatSidebarOpen,
        }),
      }
    ),
    {
      name: 'UIStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Selector hooks for better performance
 * Use these instead of accessing the whole store
 */
const sidebarSelector = (state: UIStore) => ({
  isOpen: state.sidebarOpen,
  setIsOpen: state.setSidebarOpen,
  toggle: state.toggleSidebar,
});

// Server snapshot cached to avoid infinite loops
const sidebarServerSnapshot: ReturnType<typeof sidebarSelector> = {
  isOpen: true, // Default server-side value
  setIsOpen: () => {},
  toggle: () => {},
};

export const useSidebar = () => {
  const lastSnapshotRef = useRef(sidebarServerSnapshot);
  const getSnapshot = useCallback(() => {
    const newSnapshot = sidebarSelector(useUIStore.getState());
    // Use shallow comparison to avoid unnecessary updates
    if (shallow(lastSnapshotRef.current, newSnapshot)) {
      return lastSnapshotRef.current;
    }
    lastSnapshotRef.current = newSnapshot;
    return newSnapshot;
  }, []);
  const getServerSnapshot = useCallback(() => sidebarServerSnapshot, []);
  const subscribe = useCallback((callback: () => void) => useUIStore.subscribe(callback), []);

  return useSyncExternalStore<ReturnType<typeof sidebarSelector>>(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
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

const themeSelector = (state: UIStore): ThemeSelectorSnapshot => ({
  // For Next.js compatibility
  theme: state.theme,
  actualTheme: state.actualTheme,
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme,
  // For Expo compatibility
  themeMode: state.theme,
  setThemeMode: state.setTheme,
  isDark: state.isDark,
  // Direct access to colors
  colors: state.colors,
});

// Server snapshot cached to avoid infinite loops
const themeServerSnapshot: ThemeSelectorSnapshot = {
  theme: 'system',
  actualTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  themeMode: 'system',
  setThemeMode: () => {},
  isDark: false,
  colors: lightColors,
};

export const useTheme = () => {
  const lastSnapshotRef = useRef(themeServerSnapshot);
  const getSnapshot = useCallback(() => {
    const newSnapshot = themeSelector(useUIStore.getState());
    // Use shallow comparison to avoid unnecessary updates
    if (shallow(lastSnapshotRef.current, newSnapshot)) {
      return lastSnapshotRef.current;
    }
    lastSnapshotRef.current = newSnapshot;
    return newSnapshot;
  }, []);
  const getServerSnapshot = useCallback(() => themeServerSnapshot, []);
  const subscribe = useCallback((callback: () => void) => useUIStore.subscribe(callback), []);

  const snapshot = useSyncExternalStore<ThemeSelectorSnapshot>(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return useMemo<ThemeHookSnapshot>(
    () => ({
      ...snapshot,
      themeObject: {
        mode: snapshot.actualTheme,
        colors: snapshot.colors,
      },
    }),
    [snapshot]
  );
};

const wizardSelector = (state: UIStore) => ({
  isOpen: state.isWizardOpen,
  setOpen: state.setWizardOpen,
  toggle: state.toggleWizard,
});

// Server snapshot cached to avoid infinite loops
const wizardServerSnapshot: ReturnType<typeof wizardSelector> = {
  isOpen: false,
  setOpen: () => {},
  toggle: () => {},
};

export const useWizard = () => {
  const lastSnapshotRef = useRef(wizardServerSnapshot);
  const getSnapshot = useCallback(() => {
    const newSnapshot = wizardSelector(useUIStore.getState());
    // Use shallow comparison to avoid unnecessary updates
    if (shallow(lastSnapshotRef.current, newSnapshot)) {
      return lastSnapshotRef.current;
    }
    lastSnapshotRef.current = newSnapshot;
    return newSnapshot;
  }, []);
  const getServerSnapshot = useCallback(() => wizardServerSnapshot, []);
  const subscribe = useCallback((callback: () => void) => useUIStore.subscribe(callback), []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
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
export function useSystemThemeSync() {
  const setActualTheme = useUIStore((state) => state.setActualTheme);
  const theme = useUIStore((state) => state.theme);

  // Initialize theme from localStorage on mount (Web only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedTheme = localStorage.getItem('onecoach-theme') as
        | 'light'
        | 'dark'
        | 'system'
        | null;
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        useUIStore.getState().setTheme(storedTheme);
      }
    } catch (error: unknown) {
      // Silently fail - localStorage might not be available
    }
  }, []);

  // Web: listen to media query
  useEffect(() => {
    if (typeof window === 'undefined' || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setActualTheme(e.matches ? 'dark' : 'light');
    };

    // Initial check
    handleChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, setActualTheme]);

  // Update actual theme when theme mode changes
  useEffect(() => {
    if (theme === 'system') {
      if (typeof window !== 'undefined') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        setActualTheme(systemTheme);
      }
    } else {
      setActualTheme(theme);
    }
  }, [theme, setActualTheme]);
}

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
export function useSystemThemeSyncNative(nativeColorScheme: 'light' | 'dark' | null | undefined) {
  const setActualTheme = useUIStore((state) => state.setActualTheme);
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'system' && nativeColorScheme) {
      setActualTheme(nativeColorScheme);
    } else if (theme !== 'system') {
      setActualTheme(theme);
    }
  }, [theme, nativeColorScheme, setActualTheme]);
}
