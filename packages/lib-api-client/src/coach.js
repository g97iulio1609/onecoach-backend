/**
 * Coach API Client
 *
 * API client for coach-related operations
 */
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
};
