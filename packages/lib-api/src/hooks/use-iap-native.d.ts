/**
 * IAP Native Hooks
 *
 * Hooks for React Native/Expo that handle native IAP integration
 * Combines Zustand store + native IAP APIs + TanStack Query
 */
import type { ProductId } from '@onecoach/lib-stores/iap.store';
/**
 * Hook to manage IAP in React Native
 * Replaces IAPProvider context
 */
export declare function useIAP(): {
    products: import("@onecoach/lib-stores").IAPProduct[];
    subscriptionStatus: import("@onecoach/lib-stores").SubscriptionStatus | null;
    purchaseState: import("@onecoach/lib-stores").PurchaseState;
    error: import("@onecoach/lib-stores").IAPError | null;
    loadProducts: () => Promise<void>;
    purchaseProduct: (productId: ProductId) => Promise<boolean>;
    restorePurchases: () => Promise<{
        success: boolean;
        purchases: {
            receipt: any;
            productId: string;
            platform: "ios" | "android";
            purchaseToken: string | undefined;
        }[];
        error?: undefined;
    } | {
        success: boolean;
        purchases: never[];
        error: string;
    }>;
    clearError: () => void;
};
//# sourceMappingURL=use-iap-native.d.ts.map