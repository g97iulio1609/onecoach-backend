/**
 * IAP Store
 *
 * Manages UI state for in-app purchases
 * Replaces IAPContext with Zustand store
 * Business logic (API calls, purchase operations) is in TanStack Query hooks
 */
/**
 * Product ID type
 */
export type ProductId = string;
/**
 * IAP Product interface
 */
export interface IAPProduct {
    productId: ProductId;
    price: string;
    currency: string;
    localizedPrice: string;
    title: string;
    description: string;
    subscriptionPeriod?: 'monthly' | 'yearly';
}
/**
 * Subscription Status interface
 * Compatible with IAP context types
 */
export interface SubscriptionStatus {
    isActive: boolean;
    productId: ProductId | null;
    expirationDate: number | null;
    isInTrialPeriod: boolean;
    willAutoRenew: boolean;
    platform: 'ios' | 'android' | null;
}
/**
 * Purchase State type
 */
export type PurchaseState = 'idle' | 'loading-products' | 'products-loaded' | 'purchasing' | 'verifying' | 'completed' | 'error';
/**
 * IAP Error interface
 */
export interface IAPError {
    code: string;
    message: string;
    userCancelled?: boolean;
}
/**
 * IAP state interface
 */
export interface IAPState {
    products: IAPProduct[];
    subscriptionStatus: SubscriptionStatus | null;
    purchaseState: PurchaseState;
    error: IAPError | null;
}
/**
 * IAP actions interface
 */
export interface IAPActions {
    setProducts: (products: IAPProduct[]) => void;
    setSubscriptionStatus: (status: SubscriptionStatus | null) => void;
    setPurchaseState: (state: PurchaseState) => void;
    setError: (error: IAPError | null) => void;
    clearError: () => void;
}
/**
 * Combined store type
 */
export type IAPStore = IAPState & IAPActions;
/**
 * IAP Store
 */
export declare const useIAPStore: import("zustand").UseBoundStore<Omit<Omit<import("zustand").StoreApi<IAPStore>, "setState" | "devtools"> & {
    setState(partial: IAPStore | Partial<IAPStore> | ((state: IAPStore) => IAPStore | Partial<IAPStore>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    setState(state: IAPStore | ((state: IAPStore) => IAPStore), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    devtools: {
        cleanup: () => void;
    };
}, "setState" | "persist"> & {
    setState(partial: IAPStore | Partial<IAPStore> | ((state: IAPStore) => IAPStore | Partial<IAPStore>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): unknown;
    setState(state: IAPStore | ((state: IAPStore) => IAPStore), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<IAPStore, unknown, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: IAPStore) => void) => () => void;
        onFinishHydration: (fn: (state: IAPStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<IAPStore, unknown, unknown>>;
    };
}>;
/**
 * Selector hooks for better performance
 */
export declare const useIAPProducts: () => {
    products: IAPProduct[];
    setProducts: (products: IAPProduct[]) => void;
};
export declare const useIAPSubscription: () => {
    subscriptionStatus: SubscriptionStatus | null;
    setSubscriptionStatus: (status: SubscriptionStatus | null) => void;
};
export declare const useIAPPurchase: () => {
    purchaseState: PurchaseState;
    setPurchaseState: (state: PurchaseState) => void;
    error: IAPError | null;
    setError: (error: IAPError | null) => void;
    clearError: () => void;
};
//# sourceMappingURL=iap.store.d.ts.map