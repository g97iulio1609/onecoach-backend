import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
export const analyticsKeys = {
    overview: (period) => ['analytics', 'overview', period],
};
export function useAnalyticsOverview(period = '30d') {
    return useQuery({
        queryKey: analyticsKeys.overview(period),
        queryFn: async () => {
            const response = await apiClient.get(`/api/analytics/overview?period=${period}`);
            return response.report;
        },
    });
}
