/**
 * Exercise API
 *
 * API functions per exercises
 */
import { apiClient } from './client';
export const exerciseApi = {
    /**
     * Get all exercises with optional filters
     */
    async list(params) {
        const searchParams = new URLSearchParams();
        if (params?.search)
            searchParams.set('search', params.search);
        if (params?.page)
            searchParams.set('page', params.page.toString());
        if (params?.pageSize)
            searchParams.set('pageSize', params.pageSize.toString());
        if (params?.exerciseTypeId)
            searchParams.set('exerciseTypeId', params.exerciseTypeId);
        if (params?.equipmentIds?.length)
            searchParams.set('equipmentIds', params.equipmentIds.join(','));
        if (params?.bodyPartIds?.length)
            searchParams.set('bodyPartIds', params.bodyPartIds.join(','));
        if (params?.muscleIds?.length)
            searchParams.set('muscleIds', params.muscleIds.join(','));
        if (params?.approvalStatus)
            searchParams.set('approvalStatus', params.approvalStatus);
        if (params?.includeTranslations)
            searchParams.set('includeTranslations', 'true');
        if (params?.includeUnapproved)
            searchParams.set('includeUnapproved', 'true');
        const query = searchParams.toString();
        return apiClient.get(`/api/exercises${query ? `?${query}` : ''}`);
    },
    /**
     * Get exercise by ID
     */
    async getById(id) {
        return apiClient.get(`/api/exercises/${id}`);
    },
    /**
     * Create exercise
     */
    async create(data) {
        return apiClient.post('/api/exercises', data);
    },
    /**
     * Update exercise
     */
    async update(id, data) {
        return apiClient.put(`/api/exercises/${id}`, data);
    },
    /**
     * Delete exercise
     */
    async delete(id) {
        return apiClient.delete(`/api/exercises/${id}`);
    },
    /**
     * Batch operations (approve, reject, delete)
     */
    async batch(action, ids) {
        return apiClient.post('/api/admin/exercises/batch', { action, ids });
    },
};
