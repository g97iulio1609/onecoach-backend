/**
 * Affiliate Logger Service
 *
 * Servizio per logging strutturato di eventi affiliate
 */
declare class AffiliateLogger {
    private logEvent;
    logRegistration(params: {
        userId: string;
        referralCode?: string;
        rewardIds?: string[];
        credits?: number;
    }): void;
    logSubscription(params: {
        userId: string;
        referralCode?: string;
        invoiceId: string;
        subscriptionId: string;
        amount: number;
        currency: string;
        commissionRewards?: Array<{
            level: number;
            amount: number;
            userId: string;
        }>;
    }): void;
    logCancellation(params: {
        userId: string;
        attributionIds: string[];
        graceEndAt: Date;
    }): void;
    logRewardReleased(params: {
        rewardId: string;
        userId: string;
        type: string;
        level: number;
        credits?: number;
        amount?: number;
        currency?: string;
    }): void;
    logPayoutCreated(params: {
        payoutId: string;
        userId: string;
        rewardIds: string[];
        totalAmount: number;
        currency: string;
    }): void;
    logPayoutApproved(params: {
        userId: string;
        rewardIds: string[];
        totalAmount: number;
        currency: string;
        approvedBy: string;
    }): void;
    logError(params: {
        event: string;
        error: Error;
        userId?: string;
        metadata?: Record<string, unknown>;
    }): void;
    getMetrics(params?: {
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        period: {
            start: string;
            end: string;
        };
        metrics: {
            totalRegistrations: number;
            totalSubscriptions: number;
            totalCommissions: number;
            avgCommission: number;
            conversionRate: number;
        };
    }>;
}
export declare const affiliateLogger: AffiliateLogger;
export {};
//# sourceMappingURL=affiliate-logger.service.d.ts.map