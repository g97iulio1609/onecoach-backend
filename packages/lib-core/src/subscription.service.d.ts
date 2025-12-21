/**
 * Subscription Service
 *
 * Gestione abbonamenti Stripe
 * Implementa ISubscriptionService contract
 */
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import type { ISubscriptionService } from '@onecoach/contracts';
import type Stripe from 'stripe';
/**
 * Implementazione Subscription Service
 */
export declare class SubscriptionService implements ISubscriptionService {
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
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        stripeCustomerId: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
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
    private mapStripeStatus;
    private getPriceIdForPlan;
}
/**
 * Singleton instance
 */
export declare const subscriptionService: SubscriptionService;
