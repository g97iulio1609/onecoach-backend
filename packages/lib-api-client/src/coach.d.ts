import type { MarketplacePlanType } from '@onecoach/types';
export interface MarketplacePlanCardProps {
    id: string;
    title: string;
    description: string;
    planType: MarketplacePlanType;
    coverImage?: string | null;
    price: number;
    currency: string;
    isPublished: boolean;
    totalPurchases: number;
    averageRating: number | null;
    totalReviews: number;
    createdAt: Date | string;
}
export interface CoachDashboardPlansFilters {
    planType?: MarketplacePlanType;
    isPublished?: boolean;
    page?: number;
    limit?: number;
}
export interface CoachDashboardPlansResponse {
    plans: MarketplacePlanCardProps[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
export interface CoachClient {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    programsPurchased: number;
    lastActive: Date | null;
    totalSpent: number;
    purchases: Array<{
        id: string;
        planTitle: string;
        planType: string;
        purchasedAt: Date;
        price: number;
    }>;
}
export interface CoachClientsResponse {
    clients: CoachClient[];
    total: number;
}
export interface CoachClientsFilters {
    search?: string;
    sortBy?: 'name' | 'totalSpent' | 'programsPurchased' | 'lastActive';
    sortOrder?: 'asc' | 'desc';
}
export interface CoachDashboardStats {
    totalSales: number;
    totalRevenue: number;
    averageRating: number | null;
    totalReviews: number;
    totalPlans: number;
    publishedPlans: number;
    draftPlans: number;
}
export interface CoachProfile {
    id: string;
    userId: string;
    bio?: string | null;
    credentials?: string[] | null;
    coachingStyle?: string | null;
    linkedinUrl?: string | null;
    instagramUrl?: string | null;
    websiteUrl?: string | null;
    isPubliclyVisible: boolean;
    verificationStatus: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface PublicCoachProfile extends CoachProfile {
    stats?: {
        totalPlans: number;
        totalSales: number;
        averageRating: number;
    };
}
export interface CoachProfileResponse {
    profile: CoachProfile;
}
export interface PublicCoachProfileResponse {
    profile: PublicCoachProfile;
    plans: unknown[];
    totalPlans: number;
}
export declare const coachApi: {
    /**
     * Get coach profile (current user's profile)
     */
    getProfile(): Promise<CoachProfileResponse>;
    /**
     * Get public coach profile
     */
    getPublicProfile(userId: string): Promise<PublicCoachProfileResponse>;
    /**
     * Create coach profile
     */
    createProfile(data: Partial<CoachProfile>): Promise<CoachProfileResponse>;
    /**
     * Update coach profile
     */
    updateProfile(data: Partial<CoachProfile>): Promise<CoachProfileResponse>;
    /**
     * Get coach dashboard stats
     */
    getDashboardStats(): Promise<CoachDashboardStats>;
    /**
     * Get coach dashboard plans with filters
     */
    getDashboardPlans(filters?: CoachDashboardPlansFilters): Promise<CoachDashboardPlansResponse>;
    /**
     * Get coach's clients
     */
    getClients(filters?: CoachClientsFilters): Promise<CoachClientsResponse>;
};
//# sourceMappingURL=coach.d.ts.map