/**
 * Dashboard Query Keys and Functions
 *
 * Standardized query keys and query functions for dashboard-related queries
 */
import { apiClient } from '../client';
/**
 * Query keys for dashboard queries
 */
export const dashboardKeys = {
    all: ['dashboard'],
    stats: () => [...dashboardKeys.all, 'stats'],
    activity: () => [...dashboardKeys.all, 'activity'],
};
/**
 * Query functions for dashboard
 */
export const dashboardQueries = {
    /**
     * Get dashboard stats
     * Note: This endpoint may not exist yet, using a fallback
     */
    getStats: async () => {
        try {
            const response = await apiClient.get('/api/dashboard/stats');
            return response;
        }
        catch (error) {
            // Fallback to default stats if endpoint doesn't exist
            return {
                stats: {
                    workoutsThisWeek: 0,
                    workoutsThisMonth: 0,
                    caloriesTrackedToday: 0,
                    currentStreak: 0,
                    weightChange30Days: 0,
                    totalVolumeThisMonth: 0,
                },
            };
        }
    },
    /**
     * Get dashboard activity
     * Note: This endpoint may not exist yet, using a fallback
     */
    getActivity: async () => {
        try {
            const response = await apiClient.get('/api/dashboard/activity');
            return response;
        }
        catch (error) {
            // Fallback to empty activities if endpoint doesn't exist
            return { activities: [] };
        }
    },
};
