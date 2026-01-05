/**
 * Coach Analytics Service
 *
 * Analytics calculations for coach dashboard
 * Implements SOLID principles (SRP)
 */
export type Period = '7d' | '30d' | '90d' | '1y';
export interface SalesTrendPoint {
    date: string;
    sales: number;
}
export interface RevenueTrendPoint {
    date: string;
    revenue: number;
}
export interface RatingTrendPoint {
    date: string;
    rating: number | null;
    reviews: number;
}
export interface TopPlan {
    planId: string;
    title: string;
    planType: 'WORKOUT' | 'NUTRITION';
    sales: number;
    revenue: number;
    averageRating: number | null;
}
/**
 * Get sales trends for a coach
 */
export declare function getSalesTrends(userId: string, period?: Period): Promise<SalesTrendPoint[]>;
/**
 * Get revenue trends for a coach
 */
export declare function getRevenueTrends(userId: string, period?: Period): Promise<RevenueTrendPoint[]>;
/**
 * Get rating trends for a coach
 */
export declare function getRatingTrends(userId: string, period?: Period): Promise<RatingTrendPoint[]>;
/**
 * Get top plans by sales
 */
export declare function getTopPlans(userId: string, limit?: number): Promise<TopPlan[]>;
//# sourceMappingURL=coach-analytics.service.d.ts.map