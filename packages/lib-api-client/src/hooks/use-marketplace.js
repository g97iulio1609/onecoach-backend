import { useQuery } from '@tanstack/react-query';
import { marketplaceApi } from '../marketplace';
export const marketplaceKeys = {
    plans: (filters) => ['marketplace', 'plans', filters],
};
export function useMarketplacePlans(filters) {
    return useQuery({
        queryKey: marketplaceKeys.plans(filters),
        queryFn: async () => {
            return marketplaceApi.getAll(filters);
        },
    });
}
