import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
export const affiliateKeys = {
    stats: ['affiliate', 'stats'],
};
export function useAffiliateStats() {
    return useQuery({
        queryKey: affiliateKeys.stats,
        queryFn: async () => {
            return apiClient.get('/api/affiliates/stats');
        },
    });
}
