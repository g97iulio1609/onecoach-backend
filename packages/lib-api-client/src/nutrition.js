/**
 * Nutrition API
 *
 * API functions per nutrition plans
 */
import { apiClient } from './client';
export const nutritionApi = {
    /**
     * Get all nutrition plans
     */
    async getAll() {
        return apiClient.get('/api/nutrition');
    },
    /**
     * Get nutrition plan by ID
     */
    async getById(id) {
        return apiClient.get(`/api/nutrition/${id}`);
    },
    /**
     * Create nutrition plan
     */
    async create(data) {
        return apiClient.post('/api/nutrition', data);
    },
    /**
     * Update nutrition plan
     */
    async update(id, data) {
        return apiClient.put(`/api/nutrition/${id}`, data);
    },
    /**
     * Delete nutrition plan
     */
    async delete(id) {
        return apiClient.delete(`/api/nutrition/${id}`);
    },
    /**
     * Get nutrition plan versions
     */
    async getVersions(id) {
        return apiClient.get(`/api/nutrition/${id}/versions`);
    },
    /**
     * Create nutrition day log
     */
    async createDayLog(planId, data) {
        return apiClient.post(`/api/nutrition/${planId}/logs`, data);
    },
    /**
     * Get nutrition day log by ID
     */
    async getDayLog(logId) {
        return apiClient.get(`/api/nutrition/logs/${logId}`);
    },
    /**
     * Update nutrition day log
     */
    async updateDayLog(logId, data) {
        return apiClient.put(`/api/nutrition/logs/${logId}`, data);
    },
};
