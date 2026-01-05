export interface AffiliateStats {
    referralCode: string | null;
    totalEarnings: number;
    invitedCount: number;
    conversionRate: number;
    recentActivity: Array<{
        id: string;
        type: string;
        amount: number;
        date: string;
        status: string;
        source: string;
    }>;
}
export declare const affiliateKeys: {
    stats: readonly ["affiliate", "stats"];
};
export declare function useAffiliateStats(): import("@tanstack/react-query").UseQueryResult<AffiliateStats, Error>;
//# sourceMappingURL=use-affiliate.d.ts.map