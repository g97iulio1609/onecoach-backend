/**
 * Subscription Service
 *
 * Gestione abbonamenti Stripe
 * Implementa ISubscriptionService contract
 */
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import type { ISubscriptionService } from '@onecoach/contracts';
import type Stripe from 'stripe';
export interface IAffiliateService {
    handlePostRegistration(params: {
        userId: string;
        referralCode: string;
        now: Date;
    }): Promise<any>;
    handleSubscriptionCancellation(params: {
        userId: string;
        occurredAt: Date;
    }): Promise<any>;
    handleInvoicePaid(params: {
        userId: string;
        stripeInvoiceId: string;
        stripeSubscriptionId: string;
        totalAmountCents: number;
        currency: string;
        occurredAt: Date;
    }): Promise<any>;
    ensureUserReferralCode?(userId: string, programId: string): Promise<any>;
}
export interface IPromotionService {
    getPromotionByCode(code: string): Promise<any>;
    applyBonusCredits(promotionId: string, userId: string): Promise<void>;
}
export interface IOpenRouterSubkeyService {
    createSubkey(params: {
        userId: string;
        credits: number;
        paymentIntentId: string;
    }): Promise<any>;
    saveSubkeyToDb(data: any, tx?: any): Promise<void>;
    revokeSubkey(keyLabel: string): Promise<void>;
}
export interface IMarketplaceService {
    createPurchase(data: any): Promise<any>;
    updatePurchaseStatus(purchaseId: string, status: string): Promise<any>;
}
export interface SubscriptionDependencies {
    affiliateService?: IAffiliateService;
    promotionService?: IPromotionService;
    openRouterSubkeyService?: IOpenRouterSubkeyService;
    marketplaceService?: IMarketplaceService;
}
/**
 * Implementazione Subscription Service
 */
export declare class SubscriptionService implements ISubscriptionService {
    private deps;
    /**
     * Inject external dependencies to resolve cyclic imports
     */
    setDependencies(deps: SubscriptionDependencies): void;
    createSetupIntent(userId: string, plan: SubscriptionPlan, promoCode?: string, referralCode?: string): Promise<Stripe.SetupIntent>;
    createSubscription(userId: string, setupIntentId: string, // This is actually paymentMethodId in logic? No, apps/next uses paymentMethodId
    plan: SubscriptionPlan, promoCode?: string, referralCode?: string): Promise<Stripe.Subscription>;
    getSubscription(userId: string): Promise<{
        id: string;
        status: SubscriptionStatus;
        plan: SubscriptionPlan;
        currentPeriodEnd: Date;
    } | null>;
    cancelSubscription(userId: string): Promise<void>;
    updateSubscription(userId: string, plan: SubscriptionPlan): Promise<Stripe.Subscription>;
    getActiveSubscription(userId: string): Promise<{
        id: string;
        userId: string | null;
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        stripeCustomerId: string | null;
        createdAt: Date;
        updatedAt: Date;
        plan: import("@prisma/client").$Enums.SubscriptionPlan;
        stripeSubscriptionId: string | null;
        stripePriceId: string | null;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        cancelAtPeriodEnd: boolean;
    } | null>;
    createPortalSession(userId: string, returnUrl: string): Promise<string>;
    handleWebhook(event: Stripe.Event): Promise<void>;
    private handleSubscriptionCreated;
    private handleSubscriptionUpdate;
    private handleSubscriptionDeleted;
    private handleInvoicePaid;
    private handleInvoicePaymentFailed;
    private handlePaymentIntentSucceeded;
    private handlePaymentRefunded;
    private handleMarketplacePurchase;
    private mapStripeStatus;
    private getPriceIdForPlan;
}
/**
 * Singleton instance
 */
export declare const subscriptionService: SubscriptionService;
