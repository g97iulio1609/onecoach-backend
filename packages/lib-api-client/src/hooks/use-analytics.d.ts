export interface AnalyticsReport {
    summary: {
        totalVolume: number;
        completedWorkouts: number;
        averageCalories: number;
        currentWeight: number;
    };
    charts: {
        activity: Array<{
            name: string;
            workout: number;
            nutrition: number;
        }>;
        muscleDistribution: Array<{
            name: string;
            value: number;
        }>;
        macros: Array<{
            name: string;
            value: number;
            color: string;
        }>;
    };
    recentPRs: Array<{
        exercise: string;
        value: string;
        date: string;
        improvement: string;
    }>;
}
export declare const analyticsKeys: {
    overview: (period: string) => readonly ["analytics", "overview", string];
};
export declare function useAnalyticsOverview(period?: string): import("@tanstack/react-query").UseQueryResult<AnalyticsReport, Error>;
//# sourceMappingURL=use-analytics.d.ts.map