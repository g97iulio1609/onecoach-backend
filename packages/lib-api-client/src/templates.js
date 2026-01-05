/**
 * Templates API
 *
 * API functions per workout and nutrition templates
 */
import { apiClient } from './client';
export const templateApi = {
    /**
     * Get workout templates
     */
    async getWorkoutTemplates() {
        return apiClient.get('/api/workout-templates');
    },
    /**
     * Create workout template
     */
    async createWorkoutTemplate(data) {
        return apiClient.post('/api/workout-templates', data);
    },
    /**
     * Update workout template
     */
    async updateWorkoutTemplate(id, data) {
        return apiClient.put(`/api/workout-templates/${id}`, data);
    },
    /**
     * Delete workout template
     */
    async deleteWorkoutTemplate(id) {
        return apiClient.delete(`/api/workout-templates/${id}`);
    },
    /**
     * Get nutrition templates
     */
    async getNutritionTemplates() {
        return apiClient.get('/api/nutrition-templates');
    },
    /**
     * Create nutrition template
     */
    async createNutritionTemplate(data) {
        return apiClient.post('/api/nutrition-templates', data);
    },
    /**
     * Update nutrition template
     */
    async updateNutritionTemplate(id, data) {
        return apiClient.put(`/api/nutrition-templates/${id}`, data);
    },
    /**
     * Delete nutrition template
     */
    async deleteNutritionTemplate(id) {
        return apiClient.delete(`/api/nutrition-templates/${id}`);
    },
};
