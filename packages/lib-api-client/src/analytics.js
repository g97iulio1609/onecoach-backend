/**
 * Analytics API
 *
 * API functions per analytics data
 */
import { apiClient } from './client';
export const analyticsApi = {
    /**
     * Get analytics overview
     */
    async getOverview(params) {
        const searchParams = new URLSearchParams();
        if (params?.startDate)
            searchParams.set('startDate', params.startDate);
        if (params?.endDate)
            searchParams.set('endDate', params.endDate);
        if (params?.period)
            searchParams.set('period', params.period);
        const query = searchParams.toString();
        return apiClient.get(`/api/analytics/overview${query ? `?${query}` : ''}`);
    },
    /**
     * Get chart data
     */
    async getChartData(params) {
        const searchParams = new URLSearchParams();
        searchParams.set('type', params.type);
        if (params.startDate)
            searchParams.set('startDate', params.startDate);
        if (params.endDate)
            searchParams.set('endDate', params.endDate);
        if (params.period)
            searchParams.set('period', params.period);
        const query = searchParams.toString();
        return apiClient.get(`/api/analytics/charts?${query}`);
    },
    /**
     * Get AI insights
     */
    async getAiInsights(period = '30d') {
        return apiClient.get(`/api/copilot/analytics?period=${period}`);
    },
};
