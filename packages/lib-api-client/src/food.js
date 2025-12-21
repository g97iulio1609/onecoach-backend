/**
 * Food API
 *
 * API functions per food items
 */
import { apiClient } from './client';
export const foodApi = {
    /**
     * Get all foods with optional filters
     */
    async list(params) {
        const searchParams = new URLSearchParams();
        if (params?.search)
            searchParams.set('search', params.search);
        if (params?.brandId)
            searchParams.set('brandId', params.brandId);
        if (params?.categoryIds?.length)
            searchParams.set('categoryIds', params.categoryIds.join(','));
        if (params?.barcode)
            searchParams.set('barcode', params.barcode);
        if (params?.kcalMin !== undefined)
            searchParams.set('kcalMin', params.kcalMin.toString());
        if (params?.kcalMax !== undefined)
            searchParams.set('kcalMax', params.kcalMax.toString());
        if (params?.macroDominant)
            searchParams.set('macroDominant', params.macroDominant);
        if (params?.minProteinPct !== undefined)
            searchParams.set('minProteinPct', params.minProteinPct.toString());
        if (params?.minCarbPct !== undefined)
            searchParams.set('minCarbPct', params.minCarbPct.toString());
        if (params?.minFatPct !== undefined)
            searchParams.set('minFatPct', params.minFatPct.toString());
        if (params?.page)
            searchParams.set('page', params.page.toString());
        if (params?.pageSize)
            searchParams.set('pageSize', params.pageSize.toString());
        if (params?.sortBy)
            searchParams.set('sortBy', params.sortBy);
        if (params?.sortOrder)
            searchParams.set('sortOrder', params.sortOrder);
        const query = searchParams.toString();
        return apiClient.get(`/api/food${query ? `?${query}` : ''}`);
    },
    /**
     * Get food by ID
     */
    async getById(id) {
        return apiClient.get(`/api/food/${id}`);
    },
    /**
     * Create food
     */
    async create(data) {
        return apiClient.post('/api/food', data);
    },
    /**
     * Update food
     */
    async update(id, data) {
        return apiClient.put(`/api/food/${id}`, data);
    },
    /**
     * Delete food
     */
    async delete(id) {
        return apiClient.delete(`/api/food/${id}`);
    },
    /**
     * Update food using AI
     */
    async updateWithAI(id, data) {
        return apiClient.put(`/api/admin/foods/ai-update/${id}`, data);
    },
    /**
     * Batch operations (delete, update)
     */
    async batch(action, ids, data) {
        return apiClient.post('/api/admin/foods/batch', { action, ids, data });
    },
};
