/**
 * IAP Store
 *
 * Manages UI state for in-app purchases
 * Replaces IAPContext with Zustand store
 * Business logic (API calls, purchase operations) is in TanStack Query hooks
 */
'use client';
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
/**
 * Initial state
 */
const initialState = {
    products: [],
    subscriptionStatus: null,
    purchaseState: 'idle',
    error: null,
};
/**
 * IAP Store
 */
export const useIAPStore = create()(devtools(persist((set) => ({
    ...initialState,
    setProducts: (products) => set({ products }),
    setSubscriptionStatus: (status) => set({ subscriptionStatus: status }),
    setPurchaseState: (state) => set({ purchaseState: state }),
    setError: (error) => set({ error }),
    clearError: () => set((state) => ({
        error: null,
        purchaseState: state.purchaseState === 'error' ? 'idle' : state.purchaseState,
    })),
}), {
    name: 'iap-storage',
    storage: createJSONStorage(() => {
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
        subscriptionStatus: state.subscriptionStatus,
        // Don't persist runtime state
        purchaseState: 'idle',
        error: null,
    }),
}), {
    name: 'IAPStore',
    enabled: process.env.NODE_ENV === 'development',
}));
/**
 * Selector hooks for better performance
 */
export const useIAPProducts = () => useIAPStore((state) => ({
    products: state.products,
    setProducts: state.setProducts,
}));
export const useIAPSubscription = () => useIAPStore((state) => ({
    subscriptionStatus: state.subscriptionStatus,
    setSubscriptionStatus: state.setSubscriptionStatus,
}));
export const useIAPPurchase = () => useIAPStore((state) => ({
    purchaseState: state.purchaseState,
    setPurchaseState: state.setPurchaseState,
    error: state.error,
    setError: state.setError,
    clearError: state.clearError,
}));
