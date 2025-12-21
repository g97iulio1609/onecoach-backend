/**
 * Setup Intent Service
 *
 * Gestione Setup Intents per salvare Payment Methods per subscription future
 */
import type Stripe from 'stripe';
export interface CreateSetupIntentParams {
    userId: string;
    metadata?: Record<string, string>;
}
/**
 * Setup Intent Service
 */
export declare class SetupIntentService {
    /**
     * Crea un Setup Intent per salvare un Payment Method
     */
    static createSetupIntent(params: CreateSetupIntentParams): Promise<Stripe.SetupIntent>;
    /**
     * Recupera un Setup Intent
     */
    static retrieveSetupIntent(setupIntentId: string): Promise<Stripe.SetupIntent>;
    /**
     * Conferma un Setup Intent con un Payment Method
     */
    static confirmSetupIntent(setupIntentId: string, paymentMethodId: string): Promise<Stripe.SetupIntent>;
}
