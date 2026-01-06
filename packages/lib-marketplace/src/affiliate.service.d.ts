import { Prisma } from '@prisma/client';
type AffiliateProgramWithLevels = Prisma.affiliate_programsGetPayload<{
    include: {
        affiliate_program_levels: true;
    };
}>;
export declare class AffiliateService {
    /**
     * Recupera il programma affiliati attivo con livelli
     */
    static getActiveProgram(): Promise<AffiliateProgramWithLevels | null>;
    /**
     * Genera (o restituisce) il referral code per l'utente
     */
    static ensureUserReferralCode(userId: string, programId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        metadata: Prisma.JsonValue | null;
        isActive: boolean;
        code: string;
        programId: string;
    }>;
    /**
     * Valida il referral code rispetto al programma attivo
     */
    static validateReferralCode(code: string): Promise<{
        readonly referral: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            metadata: Prisma.JsonValue | null;
            isActive: boolean;
            code: string;
            programId: string;
        };
        readonly program: {
            affiliate_program_levels: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                programId: string;
                level: number;
                commissionRate: Prisma.Decimal;
                creditReward: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            registrationCredit: number;
            baseCommissionRate: Prisma.Decimal;
            maxLevels: number;
            subscriptionGraceDays: number;
            rewardPendingDays: number;
            lifetimeCommissions: boolean;
        };
    } | null>;
    /**
     * Gestisce la registrazione, creando attributions e reward pending
     */
    static handlePostRegistration(params: {
        userId: string;
        referralCode?: string | null;
        now?: Date;
    }): Promise<void>;
    /**
     * Crea reward monetario (commissione) per invoice pagata
     */
    static handleInvoicePaid(params: {
        userId: string;
        stripeInvoiceId: string;
        stripeSubscriptionId: string;
        totalAmountCents: number;
        currency: string;
        occurredAt: Date;
    }): Promise<void>;
    /**
     * Annulla le attribution attive per l'utente dopo la cancellazione della subscription
     */
    static handleSubscriptionCancellation(params: {
        userId: string;
        occurredAt: Date;
    }): Promise<void>;
    /**
     * Rilascia le reward pending pronte per essere incassate
     * Per reward REGISTRATION_CREDIT, accredita i crediti al conto utente
     */
    static releasePendingRewards(referenceDate?: Date): Promise<number>;
    private static applyReferralCode;
    private static buildReferralChain;
    private static generateUniqueReferralCode;
    /**
     * Get or create referral code for user
     */
    static getOrCreateReferralCode(userId: string, programId?: string): Promise<{
        totalUses: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        metadata: Prisma.JsonValue | null;
        isActive: boolean;
        code: string;
        programId: string;
    }>;
    /**
     * Get affiliate statistics for user
     */
    static getAffiliateStats(userId: string): Promise<{
        totalRewards: number;
        pendingRewards: number;
        clearedRewards: number;
        cancelledRewards: number;
        totalAttributions: number;
        totalReferrals: number;
        totalEarnings: number;
        pendingEarnings: number;
        clearedEarnings: number;
        amounts: {
            pending: {
                currencyAmount: number;
                creditAmount: number;
            };
            cleared: {
                currencyAmount: number;
                creditAmount: number;
            };
            cancelled: {
                currencyAmount: number;
                creditAmount: number;
            };
        };
    }>;
    /**
     * Approve a payout (affiliate reward)
     */
    static approvePayout(payoutId: string, adminUserId: string, notes?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.AffiliateRewardStatus;
        userId: string | null;
        metadata: Prisma.JsonValue | null;
        type: import("@prisma/client").$Enums.AffiliateRewardType;
        programId: string;
        level: number;
        attributionId: string;
        currencyAmount: Prisma.Decimal | null;
        currencyCode: string | null;
        creditAmount: number | null;
        pendingUntil: Date;
        readyAt: Date | null;
        settledAt: Date | null;
    }>;
    /**
     * Reject a payout (affiliate reward)
     */
    static rejectPayout(payoutId: string, adminUserId: string, reason: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.AffiliateRewardStatus;
        userId: string | null;
        metadata: Prisma.JsonValue | null;
        type: import("@prisma/client").$Enums.AffiliateRewardType;
        programId: string;
        level: number;
        attributionId: string;
        currencyAmount: Prisma.Decimal | null;
        currencyCode: string | null;
        creditAmount: number | null;
        pendingUntil: Date;
        readyAt: Date | null;
        settledAt: Date | null;
    }>;
    /**
     * Mark a payout as paid
     */
    static markPayoutPaid(payoutId: string, adminUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.AffiliateRewardStatus;
        userId: string | null;
        metadata: Prisma.JsonValue | null;
        type: import("@prisma/client").$Enums.AffiliateRewardType;
        programId: string;
        level: number;
        attributionId: string;
        currencyAmount: Prisma.Decimal | null;
        currencyCode: string | null;
        creditAmount: number | null;
        pendingUntil: Date;
        readyAt: Date | null;
        settledAt: Date | null;
    }>;
}
export {};
//# sourceMappingURL=affiliate.service.d.ts.map