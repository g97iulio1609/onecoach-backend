/**
 * Credits React Query Hooks
 *
 * Custom hooks for credits queries
 */
'use client';
import { useQuery } from '@tanstack/react-query';
import { creditsKeys, creditsQueries } from '../queries/credits.queries';
/**
 * Hook to get credit balance
 */
export function useCredits() {
    return useQuery({
        queryKey: creditsKeys.balance(),
        queryFn: creditsQueries.getBalance,
        staleTime: 30 * 1000, // 30 seconds
        refetchOnWindowFocus: true,
    });
}
/**
 * Hook to get credit history
 */
export function useCreditsHistory(limit = 50) {
    return useQuery({
        queryKey: creditsKeys.history(limit),
        queryFn: () => creditsQueries.getHistory(limit),
        staleTime: 60 * 1000, // 1 minute
    });
}
