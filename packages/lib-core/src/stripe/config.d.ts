/**
 * Stripe Configuration
 *
 * Configurazione piani e prodotti Stripe
 */
import type { PlanPricing, CreditPackPricing } from '@onecoach/types';
import { CREDIT_PACK_OPTIONS, getCreditPackPriceId } from '@onecoach/constants/credit-packs';
/**
 * Piani abbonamento
 */
export declare const STRIPE_PLANS: {
    plus: PlanPricing;
    pro: PlanPricing;
};
/**
 * Pacchetti crediti
 */
export declare const CREDIT_PACKS: CreditPackPricing[];
export { CREDIT_PACK_OPTIONS, getCreditPackPriceId };
/**
 * Webhook events da gestire
 */
export declare const STRIPE_WEBHOOK_EVENTS: {
    readonly CHECKOUT_COMPLETED: "checkout.session.completed";
    readonly SUBSCRIPTION_CREATED: "customer.subscription.created";
    readonly SUBSCRIPTION_UPDATED: "customer.subscription.updated";
    readonly SUBSCRIPTION_DELETED: "customer.subscription.deleted";
    readonly INVOICE_PAID: "invoice.paid";
    readonly INVOICE_PAYMENT_FAILED: "invoice.payment_failed";
    readonly PAYMENT_INTENT_SUCCEEDED: "payment_intent.succeeded";
    readonly PAYMENT_INTENT_FAILED: "payment_intent.payment_failed";
};
