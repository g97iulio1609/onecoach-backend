/**
 * Dashboard React Query Hooks
 *
 * Custom hooks for dashboard queries
 */
'use client';
import { useQueries } from '@tanstack/react-query';
import { dashboardKeys, dashboardQueries } from '../queries/dashboard.queries';
import { creditsKeys, creditsQueries } from '../queries/credits.queries';
/**
 * Hook to get all dashboard data
 * Combines stats, credits, and activities
 */
export function useDashboardData() {
    const results = useQueries({
        queries: [
            {
                queryKey: dashboardKeys.stats(),
                queryFn: dashboardQueries.getStats,
                staleTime: 60 * 1000, // 1 minute
            },
            {
                queryKey: creditsKeys.balance(),
                queryFn: creditsQueries.getBalance,
                staleTime: 30 * 1000, // 30 seconds
            },
            {
                queryKey: dashboardKeys.activity(),
                queryFn: dashboardQueries.getActivity,
                staleTime: 60 * 1000, // 1 minute
            },
        ],
    });
    const [statsQuery, creditsQuery, activityQuery] = results;
    return {
        stats: statsQuery.data?.stats,
        credits: creditsQuery.data,
        activities: activityQuery.data?.activities ?? [],
        isLoading: statsQuery.isLoading || creditsQuery.isLoading || activityQuery.isLoading,
        isError: statsQuery.isError || creditsQuery.isError || activityQuery.isError,
        error: statsQuery.error || creditsQuery.error || activityQuery.error,
        refetch: () => {
            statsQuery.refetch();
            creditsQuery.refetch();
            activityQuery.refetch();
        },
    };
}
