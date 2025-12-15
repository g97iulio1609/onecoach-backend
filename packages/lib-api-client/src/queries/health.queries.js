/**
 * Health Query Keys and Functions
 *
 * TanStack Query keys and functions for health data
 */
import { apiClient } from '../client';
/**
 * Health query keys factory
 */
export const healthKeys = {
    all: ['health'],
    summary: () => [...healthKeys.all, 'summary'],
    sync: () => [...healthKeys.all, 'sync'],
    data: (dataType, startDate, endDate) => [...healthKeys.all, 'data', dataType, startDate, endDate],
};
/**
 * Health query functions
 */
export const healthQueries = {
    /**
     * Get health summary
     */
    getSummary: async () => {
        const response = await apiClient.get('/api/health/summary');
        return response;
    },
    /**
     * Sync health data
     */
    syncData: async (request) => {
        const response = await apiClient.post('/api/health/sync', request);
        return response;
    },
};
