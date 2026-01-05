/**
 * Workout API
 *
 * API functions per workout programs
 */
import { apiClient } from './client';
export const workoutApi = {
    /**
     * Get all workout programs
     */
    async getAll() {
        return apiClient.get('/api/workout');
    },
    /**
     * Get workout program by ID
     */
    async getById(id) {
        return apiClient.get(`/api/workout/${id}`);
    },
    /**
     * Create workout program
     */
    async create(data) {
        return apiClient.post('/api/workout', data);
    },
    /**
     * Update workout program
     */
    async update(id, data) {
        return apiClient.patch(`/api/workout/${id}`, data);
    },
    /**
     * Delete workout program
     */
    async delete(id) {
        return apiClient.delete(`/api/workout/${id}`);
    },
    /**
     * Duplicate workout program
     */
    async duplicate(id) {
        return apiClient.post(`/api/workout/${id}/duplicate`, {});
    },
    /**
     * Create a new workout session
     */
    async createSession(programId, data) {
        return apiClient.post(`/api/workouts/${programId}/sessions`, data);
    },
    /**
     * Get workout session by ID
     */
    async getSession(sessionId) {
        return apiClient.get(`/api/workouts/sessions/${sessionId}`);
    },
    /**
     * Update workout session
     */
    async updateSession(sessionId, data) {
        return apiClient.put(`/api/workouts/sessions/${sessionId}`, data);
    },
};
