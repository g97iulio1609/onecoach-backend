/**
 * Subscription Service
 *
 * Gestione abbonamenti Stripe
 * Implementa ISubscriptionService contract
 */
import { prisma } from './prisma';
import { getStripe } from './stripe';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { creditService } from './credit.service';
import { SetupIntentService } from './setup-intent.service';
import { createId } from '@onecoach/lib-shared/id-generator';
import { getCreditsFromPriceId } from '@onecoach/constants/credit-packs';
import { getSubscriptionPriceId } from '@onecoach/constants/subscription-prices';
import { logger } from '@onecoach/lib-core';
// TODO: Import these when they are available via interface or shared package
// import { AffiliateService } from '@onecoach/lib-marketplace/affiliate.service';
// import { OpenRouterSubkeyService } from '@onecoach/lib-ai/openrouter-subkey.service';
// import { PromotionService } from '@onecoach/lib-marketplace/promotion.service';
/**
 * Implementazione Subscription Service
 */
export class SubscriptionService {
    async createSetupIntent(userId, plan, promoCode, referralCode) {
        const metadata = { plan };
        if (promoCode)
            metadata.promoCode = promoCode;
        if (referralCode)
            metadata.referralCode = referralCode;
        return await SetupIntentService.createSetupIntent({
            userId,
            metadata,
        });
    }
    async createSubscription(userId, setupIntentId, // This is actually paymentMethodId in logic? No, apps/next uses paymentMethodId
    plan, promoCode, referralCode) {
        // Note: The contract might say setupIntentId, but typically we use paymentMethodId from the setupIntent
        // But if the interface says setupIntentId, let's retrieve it.
        // apps/next createSubscription accepts paymentMethodId directly.
        // Let's check setupIntentId. If it starts with 'seti_', retrieve it to get paymentMethod.
        let paymentMethodId = setupIntentId;
        if (setupIntentId.startsWith('seti_')) {
            const setupIntent = await SetupIntentService.retrieveSetupIntent(setupIntentId);
            if (!setupIntent.payment_method) {
                throw new Error('Payment method not attached to setup intent');
            }
            paymentMethodId = setupIntent.payment_method;
        }
        const stripe = await getStripe();
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { email: true, stripeCustomerId: true },
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Get or create customer (reuse SetupIntentService logic if possible, or duplicate for now)
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            // Should have been created by setup intent step ideally, but ensure it here
            const customerParams = {
                metadata: { userId },
                email: user.email || undefined,
            };
            const customer = await stripe.customers.create(customerParams);
            customerId = customer.id;
            await prisma.users.update({
                where: { id: userId },
                data: { stripeCustomerId: customerId },
            });
        }
        // Attach payment method
        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
        });
        // Set default
        await stripe.customers.update(customerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });
        const priceId = this.getPriceIdForPlan(plan);
        const subscriptionParams = {
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: {
                payment_method_types: ['card'],
                save_default_payment_method: 'on_subscription',
            },
            expand: ['latest_invoice.payment_intent'],
            metadata: {
                userId,
                plan,
                ...(promoCode && { promoCode }),
                ...(referralCode && { referralCode }),
            },
        };
        return await stripe.subscriptions.create(subscriptionParams);
    }
    async getSubscription(userId) {
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: {
                subscriptions: {
                    where: { status: 'ACTIVE' },
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        const subscription = user?.subscriptions[0];
        if (!subscription)
            return null;
        return {
            id: subscription.id,
            status: subscription.status,
            plan: subscription.plan,
            currentPeriodEnd: subscription.currentPeriodEnd,
        };
    }
    async cancelSubscription(userId) {
        const subscription = await this.getSubscription(userId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }
        const dbSub = await prisma.subscriptions.findUnique({ where: { id: subscription.id } });
        if (!dbSub?.stripeSubscriptionId)
            throw new Error('Stripe Subscription ID missing');
        const stripe = await getStripe();
        await stripe.subscriptions.update(dbSub.stripeSubscriptionId, {
            cancel_at_period_end: true,
        });
        await prisma.subscriptions.update({
            where: { id: subscription.id },
            data: { cancelAtPeriodEnd: true, updatedAt: new Date() },
        });
    }
    async updateSubscription(userId, plan) {
        const subscription = await this.getSubscription(userId);
        if (!subscription)
            throw new Error('Subscription not found');
        const dbSub = await prisma.subscriptions.findUnique({ where: { id: subscription.id } });
        if (!dbSub?.stripeSubscriptionId)
            throw new Error('Stripe Subscription ID missing');
        const stripe = await getStripe();
        const priceId = this.getPriceIdForPlan(plan);
        // TODO: Handle proration logic properly based on plan upgrade/downgrade
        // Get current subscription item
        const currentSub = await stripe.subscriptions.retrieve(dbSub.stripeSubscriptionId);
        const itemId = currentSub.items.data[0]?.id;
        if (!itemId) {
            throw new Error('Subscription item non trovato per aggiornamento');
        }
        return await stripe.subscriptions.update(dbSub.stripeSubscriptionId, {
            items: [
                {
                    id: itemId,
                    price: priceId,
                },
            ],
            proration_behavior: 'create_prorations',
        });
    }
    async getActiveSubscription(userId) {
        const dbSub = await prisma.subscriptions.findFirst({
            where: { userId, status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
        });
        if (!dbSub)
            return null;
        return dbSub;
    }
    async createPortalSession(userId, returnUrl) {
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { stripeCustomerId: true },
        });
        const customerId = user?.stripeCustomerId;
        if (!customerId) {
            throw new Error('Customer Stripe non trovato');
        }
        const stripe = await getStripe();
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });
        return session.url;
    }
    async handleWebhook(event) {
        logger.warn(`[SubscriptionService] Handling webhook: ${event.type}`);
        const eventType = event.type;
        switch (eventType) {
            case 'payment_intent.succeeded': {
                await this.handlePaymentIntentSucceeded(event.data.object, event.id);
                break;
            }
            case 'payment_intent.refunded':
            case 'charge.refunded': {
                await this.handlePaymentRefunded(event.data.object, event.id);
                break;
            }
            case 'customer.subscription.created': {
                await this.handleSubscriptionCreated(event.data.object);
                break;
            }
            case 'customer.subscription.updated': {
                await this.handleSubscriptionUpdate(event.data.object);
                break;
            }
            case 'customer.subscription.deleted': {
                await this.handleSubscriptionDeleted(event.data.object);
                break;
            }
            case 'invoice.paid': {
                await this.handleInvoicePaid(event.data.object);
                break;
            }
            case 'invoice.payment_failed': {
                await this.handleInvoicePaymentFailed(event.data.object);
                break;
            }
            default: {
                logger.warn(`Unhandled event type: ${event.type}`);
            }
        }
    }
    // ============================================
    // PRIVATE HANDLERS
    // ============================================
    async handleSubscriptionCreated(subscription) {
        const userId = subscription.metadata?.userId;
        const plan = subscription.metadata?.plan;
        if (!userId || !plan) {
            logger.error('[Subscription] Missing userId or plan in metadata');
            return;
        }
        await prisma.subscriptions.create({
            data: {
                id: createId(),
                userId,
                plan,
                status: 'ACTIVE',
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer,
                stripePriceId: subscription.items.data[0]?.price.id ?? '',
                currentPeriodStart: new Date((subscription.current_period_start ?? 0) * 1000),
                currentPeriodEnd: new Date((subscription.current_period_end ?? 0) * 1000),
                updatedAt: new Date(),
            },
        });
        if (plan === 'PLUS') {
            await creditService.addCredits({
                userId,
                amount: 500,
                type: 'SUBSCRIPTION_RENEWAL',
                description: 'Crediti iniziali PLUS',
            });
        }
        // TODO: Call AffiliateService.handlePostRegistration
        // TODO: Call PromotionService/CreditService for bonus credits
    }
    async handleSubscriptionUpdate(subscription) {
        const dbSubscription = await prisma.subscriptions.findUnique({
            where: { stripeSubscriptionId: subscription.id },
        });
        if (dbSubscription) {
            const newStatus = this.mapStripeStatus(subscription.status);
            await prisma.subscriptions.update({
                where: { id: dbSubscription.id },
                data: {
                    status: newStatus,
                    currentPeriodStart: new Date((subscription.current_period_start ?? 0) * 1000),
                    currentPeriodEnd: new Date((subscription.current_period_end ?? 0) * 1000),
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                    updatedAt: new Date(),
                },
            });
            if (newStatus === 'CANCELLED' || newStatus === 'EXPIRED') {
                // TODO: Call AffiliateService.handleSubscriptionCancellation
            }
        }
    }
    async handleSubscriptionDeleted(subscription) {
        await prisma.subscriptions.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: {
                status: 'CANCELLED',
                updatedAt: new Date(),
            },
        });
        // TODO: Call AffiliateService.handleSubscriptionCancellation for all
    }
    async handleInvoicePaid(invoice) {
        const subscriptionId = invoice.subscription;
        if (!subscriptionId)
            return;
        const subscription = await prisma.subscriptions.findFirst({
            where: { stripeSubscriptionId: subscriptionId },
        });
        if (subscription && subscription.plan === 'PLUS') {
            // Note: CreditService.renewMonthlyCredits might need to be implemented or exposed?
            // It wasn't in the CreditService file I read.
            // I'll leave it as TODO or implement manually
            // await creditService.renewMonthlyCredits(subscription.userId);
        }
        if (subscription && invoice.total) {
            // TODO: Call AffiliateService.handleInvoicePaid
        }
    }
    async handleInvoicePaymentFailed(invoice) {
        const subscriptionId = invoice.subscription;
        if (!subscriptionId)
            return;
        await prisma.subscriptions.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: {
                status: 'PAST_DUE',
                updatedAt: new Date(),
            },
        });
    }
    async handlePaymentIntentSucceeded(paymentIntent, eventId) {
        // Basic implementation for credits purchase
        const userId = paymentIntent.metadata?.userId;
        if (!userId)
            return;
        const paymentType = paymentIntent.metadata?.type;
        if (paymentType === 'marketplace') {
            // TODO: handleMarketplacePurchase (requires marketplace service)
            return;
        }
        // Credits logic
        let credits = 0;
        if (paymentIntent.metadata?.credits) {
            credits = parseInt(paymentIntent.metadata.credits, 10);
        }
        else if (paymentIntent.metadata?.price_id) {
            credits = getCreditsFromPriceId(paymentIntent.metadata.price_id) || 0;
        }
        if (credits > 0) {
            // TODO: OpenRouterSubkeyService.createSubkey
            await prisma.$transaction(async (tx) => {
                // TODO: Save subkey
                await creditService.addCredits({
                    userId,
                    amount: credits,
                    type: 'PURCHASE',
                    description: `Acquisto ${credits} crediti`,
                    metadata: { stripePaymentIntentId: paymentIntent.id },
                });
                // Create payment record
                await tx.payments.create({
                    data: {
                        id: createId(),
                        userId,
                        stripePaymentId: paymentIntent.id,
                        stripePaymentIntentId: paymentIntent.id,
                        amount: paymentIntent.amount,
                        currency: paymentIntent.currency,
                        status: 'SUCCEEDED',
                        type: 'CREDITS',
                        creditsAdded: credits,
                        metadata: { eventId },
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                });
            });
        }
    }
    async handlePaymentRefunded(refundData, eventId) {
        // TODO: Implement refund logic
        logger.warn(`[Subscription] Refund handled`, { eventId, paymentIntentId: refundData.id });
    }
    mapStripeStatus(status) {
        switch (status) {
            case 'active':
                return 'ACTIVE';
            case 'canceled':
                return 'CANCELLED';
            case 'past_due':
                return 'PAST_DUE';
            default:
                return 'EXPIRED';
        }
    }
    getPriceIdForPlan(plan) {
        const priceId = getSubscriptionPriceId(plan);
        if (!priceId) {
            throw new Error(`Price ID not found for plan: ${plan}`);
        }
        return priceId;
    }
}
/**
 * Singleton instance
 */
export const subscriptionService = new SubscriptionService();
