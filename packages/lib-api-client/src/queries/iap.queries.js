/**
 * IAP Query Keys and Functions
 *
 * TanStack Query keys and functions for in-app purchases
 */
import { apiClient } from '../client';
/**
 * IAP query keys factory
 */
export const iapKeys = {
    all: ['iap'],
    products: () => [...iapKeys.all, 'products'],
    subscriptionStatus: () => [...iapKeys.all, 'subscription-status'],
};
/**
 * IAP query functions
 */
export const iapQueries = {
    /**
     * Get subscription status
     */
    getSubscriptionStatus: async () => {
        const response = await apiClient.get('/api/iap/subscription-status');
        return response;
    },
    /**
     * Verify receipt
     */
    verifyReceipt: async (request) => {
        const response = await apiClient.post('/api/iap/verify-receipt', request);
        return response;
    },
    /**
     * Restore purchases
     */
    restorePurchases: async (request) => {
        const response = await apiClient.post('/api/iap/restore-purchases', request);
        return response;
    },
};
