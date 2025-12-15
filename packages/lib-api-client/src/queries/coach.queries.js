/**
 * Coach Query Keys and Functions
 *
 * Standardized query keys and query functions for coach-related queries
 */
/**
 * Query keys for coach queries
 */
export const coachKeys = {
    all: ['coach'],
    profile: () => [...coachKeys.all, 'profile'],
    publicProfile: (userId) => [...coachKeys.all, 'public', userId],
    dashboardStats: () => [...coachKeys.all, 'dashboard', 'stats'],
    dashboardPlans: (filters) => [...coachKeys.all, 'dashboard', 'plans', filters],
    clients: (filters) => [...coachKeys.all, 'clients', filters],
};
/**
 * Query functions for coach
 */
export const coachQueries = {
    /**
     * Get public coach profile
     */
    getPublicProfile: async (userId) => {
        const response = await fetch(`/api/coach/public/${userId}`, {
            credentials: 'include',
        });
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Profilo non trovato o non pubblicamente visibile');
            }
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Failed to fetch coach profile');
        }
        return response.json();
    },
    /**
     * Get coach dashboard stats
     */
    getDashboardStats: async () => {
        const response = await fetch('/api/coach/dashboard/stats', {
            credentials: 'include',
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Failed to fetch dashboard stats');
        }
        return response.json();
    },
    /**
     * Get coach dashboard plans with filters
     */
    getDashboardPlans: async (filters) => {
        const params = new URLSearchParams();
        if (filters?.planType)
            params.append('planType', filters.planType);
        if (filters?.isPublished !== undefined)
            params.append('isPublished', filters.isPublished.toString());
        if (filters?.page)
            params.append('page', filters.page.toString());
        if (filters?.limit)
            params.append('limit', filters.limit.toString());
        const response = await fetch(`/api/coach/dashboard/plans?${params.toString()}`, {
            credentials: 'include',
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Failed to fetch dashboard plans');
        }
        return response.json();
    },
    /**
     * Get coach's clients
     */
    getClients: async (filters) => {
        const params = new URLSearchParams();
        if (filters?.search)
            params.append('search', filters.search);
        if (filters?.sortBy)
            params.append('sortBy', filters.sortBy);
        if (filters?.sortOrder)
            params.append('sortOrder', filters.sortOrder);
        const response = await fetch(`/api/coach/clients?${params.toString()}`, {
            credentials: 'include',
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Failed to fetch clients');
        }
        return response.json();
    },
};
