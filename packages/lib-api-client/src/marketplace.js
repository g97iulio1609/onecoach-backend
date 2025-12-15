/**
 * Marketplace API Client
 *
 * API client for marketplace-related operations
 */
import { apiClient } from './client';
export const marketplaceApi = {
    /**
     * Get all marketplace plans with filters
     */
    async getAll(filters) {
        const params = new URLSearchParams();
        if (filters?.planType)
            params.append('planType', filters.planType);
        if (filters?.minPrice)
            params.append('minPrice', filters.minPrice.toString());
        if (filters?.maxPrice)
            params.append('maxPrice', filters.maxPrice.toString());
        if (filters?.minRating)
            params.append('minRating', filters.minRating.toString());
        if (filters?.coachId)
            params.append('coachId', filters.coachId);
        if (filters?.searchQuery)
            params.append('q', filters.searchQuery);
        if (filters?.sortBy)
            params.append('sortBy', filters.sortBy);
        if (filters?.sortOrder)
            params.append('sortOrder', filters.sortOrder);
        if (filters?.page)
            params.append('page', filters.page.toString());
        if (filters?.limit)
            params.append('limit', filters.limit.toString());
        const query = params.toString();
        return apiClient.get(`/api/marketplace/plans${query ? `?${query}` : ''}`);
    },
    /**
     * Get marketplace plan by ID
     */
    async getById(id) {
        return apiClient.get(`/api/marketplace/plans/${id}`);
    },
};
