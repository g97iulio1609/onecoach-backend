/**
 * Payment Service
 *
 * Gestione Payment Intents per pagamenti one-time (crediti, marketplace)
 * Implementa IPaymentService contract
 */
import type Stripe from 'stripe';
import type { IPaymentService, CreatePaymentIntentParams, ConfirmPaymentIntentParams } from '@onecoach/contracts';
/**
 * Payment Service
 */
export declare class PaymentService implements IPaymentService {
    /**
     * Crea un Payment Intent per pagamento one-time
     */
    createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent>;
    /**
     * Conferma un Payment Intent con un Payment Method
     */
    confirmPaymentIntent(params: ConfirmPaymentIntentParams): Promise<Stripe.PaymentIntent>;
    /**
     * Recupera un Payment Intent
     */
    retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
}
export declare const paymentService: PaymentService;
//# sourceMappingURL=payment.service.d.ts.map