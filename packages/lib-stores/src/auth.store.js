/**
 * Auth Store
 *
 * Centralized authentication state management using Zustand
 * Replaces AuthContext with a simpler, more performant solution
 */
'use client';
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
/**
 * Initial state
 */
const initialState = {
    user: null,
    isLoading: true,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
};
/**
 * Auth Store
 *
 * Uses Zustand with persist middleware for cross-platform storage
 * - Web: localStorage
 * - Native: AsyncStorage (via createJSONStorage)
 */
export const useAuthStore = create()(devtools(persist((set, get) => ({
    ...initialState,
    setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
    }),
    setTokens: (accessToken, refreshToken, expiresAt) => set({
        accessToken,
        refreshToken: refreshToken ?? null,
        expiresAt,
    }),
    setLoading: (isLoading) => set({ isLoading }),
    updateUser: (updatedUser) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedUser } : null,
    })),
    updateCredits: (credits) => set((state) => ({
        user: state.user ? { ...state.user, credits } : null,
    })),
    clearAuth: () => set(initialState),
    isTokenExpired: () => {
        const { expiresAt } = get();
        if (!expiresAt)
            return true;
        return Date.now() >= expiresAt;
    },
    isTokenExpiringSoon: () => {
        const { expiresAt } = get();
        if (!expiresAt)
            return true;
        // Token expires in less than 5 minutes
        return Date.now() >= expiresAt - 5 * 60 * 1000;
    },
}), {
    name: 'auth-storage',
    storage: createJSONStorage(() => {
        // For web, use localStorage
        if (typeof window !== 'undefined') {
            return localStorage;
        }
        // For React Native, this will be replaced by AsyncStorage in the app
        return {
            getItem: () => null,
            setItem: () => { },
            removeItem: () => { },
        };
    }),
    partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
    }),
}), {
    name: 'AuthStore',
    enabled: process.env.NODE_ENV === 'development',
}));
