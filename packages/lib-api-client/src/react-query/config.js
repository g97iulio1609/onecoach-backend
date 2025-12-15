/**
 * React Query Configuration
 *
 * Configurazione condivisa per QueryClient cross-platform
 * Supporta sia Next.js che React Native/Expo
 */
/**
 * Default query options
 */
export const defaultQueryOptions = {
    queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: 3,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    },
    mutations: {
        retry: 1,
    },
};
/**
 * Create QueryClient configuration
 *
 * @param options - Optional additional configuration
 * @returns QueryClientConfig
 */
export function createQueryClientConfig(options) {
    return {
        defaultOptions: defaultQueryOptions,
        ...options,
    };
}
