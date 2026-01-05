/**
 * Credits Query Keys and Functions
 *
 * Standardized query keys and query functions for credits-related queries
 */
import { apiClient } from '../client';
/**
 * Query keys for credits queries
 */
export const creditsKeys = {
    all: ['credits'],
    balance: () => [...creditsKeys.all, 'balance'],
    history: (limit) => [...creditsKeys.all, 'history', limit],
};
/**
 * Query functions for credits
 */
export const creditsQueries = {
    /**
     * Get credit balance
     */
    getBalance: async () => {
        const response = await apiClient.get('/api/credits/balance');
        return response;
    },
    /**
     * Get credit history
     */
    getHistory: async (limit = 50) => {
        const response = await apiClient.get(`/api/credits/history?limit=${limit}`);
        return response;
    },
};
