/**
 * Credits React Query Hooks
 *
 * Custom hooks for credits queries
 */
/**
 * Hook to get credit balance
 */
export declare function useCredits(): import("@tanstack/react-query").UseQueryResult<import("../queries/credits.queries").CreditBalanceResponse, Error>;
/**
 * Hook to get credit history
 */
export declare function useCreditsHistory(limit?: number): import("@tanstack/react-query").UseQueryResult<import("../queries/credits.queries").CreditHistoryResponse, Error>;
//# sourceMappingURL=use-credits.d.ts.map