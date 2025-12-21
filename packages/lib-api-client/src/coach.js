import { apiClient } from './client';
export const coachApi = {
    /**
     * Get coach profile (current user's profile)
     */
    async getProfile() {
        return apiClient.get(`/api/coach/profile`);
    },
    /**
     * Get public coach profile
     */
    async getPublicProfile(userId) {
        return apiClient.get(`/api/coach/public/${userId}`);
    },
    /**
     * Create coach profile
     */
    async createProfile(data) {
        return apiClient.post('/api/coach/profile', data);
    },
    /**
     * Update coach profile
     */
    async updateProfile(data) {
        return apiClient.put('/api/coach/profile', data);
    },
    /**
     * Get coach dashboard stats
     */
    async getDashboardStats() {
        return apiClient.get('/api/coach/dashboard/stats');
    },
    /**
     * Get coach dashboard plans with filters
     */
    async getDashboardPlans(filters) {
        const params = new URLSearchParams();
        if (filters?.planType)
            params.append('planType', filters.planType);
        if (filters?.isPublished !== undefined)
            params.append('isPublished', filters.isPublished.toString());
        if (filters?.page)
            params.append('page', filters.page.toString());
        if (filters?.limit)
            params.append('limit', filters.limit.toString());
        return apiClient.get(`/api/coach/dashboard/plans?${params.toString()}`);
    },
    /**
     * Get coach's clients
     */
    async getClients(filters) {
        const params = new URLSearchParams();
        if (filters?.search)
            params.append('search', filters.search);
        if (filters?.sortBy)
            params.append('sortBy', filters.sortBy);
        if (filters?.sortOrder)
            params.append('sortOrder', filters.sortOrder);
        return apiClient.get(`/api/coach/clients?${params.toString()}`);
    },
};
