/**
 * Stripe Client for Frontend
 *
 * Client Stripe per operazioni client-side (Stripe Elements)
 */
import type { Stripe } from '@stripe/stripe-js';
/**
 * Inizializza e restituisce l'istanza Stripe client-side.
 * Usa lazy loading per evitare di caricare Stripe finché non necessario.
 */
export declare function getStripeClient(): Promise<Stripe | null>;
