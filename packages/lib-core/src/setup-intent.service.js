/**
 * Setup Intent Service
 *
 * Gestione Setup Intents per salvare Payment Methods per subscription future
 */
import { getStripe } from './stripe';
import { prisma } from './prisma';
/**
 * Setup Intent Service
 */
export class SetupIntentService {
    /**
     * Crea un Setup Intent per salvare un Payment Method
     */
    static async createSetupIntent(params) {
        const { userId, metadata = {} } = params;
        const stripe = getStripe();
        // Verifica che l'utente esista
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { email: true, stripeCustomerId: true },
        });
        if (!user) {
            throw new Error('Utente non trovato');
        }
        // Ottieni o crea Stripe customer
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customerParams = {
                metadata: {
                    userId,
                },
            };
            if (user.email) {
                customerParams.email = String(user.email);
            }
            const customer = await stripe.customers.create(customerParams);
            customerId = customer.id;
            // Salva customer ID
            await prisma.users.update({
                where: { id: userId },
                data: { stripeCustomerId: customerId },
            });
        }
        // Crea Setup Intent
        const setupIntent = await stripe.setupIntents.create({
            customer: customerId,
            payment_method_types: ['card'],
            usage: 'off_session', // Per subscription future
            metadata: {
                userId,
                ...metadata,
            },
        });
        return setupIntent;
    }
    /**
     * Recupera un Setup Intent
     */
    static async retrieveSetupIntent(setupIntentId) {
        const stripe = getStripe();
        return await stripe.setupIntents.retrieve(setupIntentId);
    }
    /**
     * Conferma un Setup Intent con un Payment Method
     */
    static async confirmSetupIntent(setupIntentId, paymentMethodId) {
        const stripe = getStripe();
        const setupIntent = await stripe.setupIntents.confirm(setupIntentId, {
            payment_method: paymentMethodId,
        });
        return setupIntent;
    }
}
