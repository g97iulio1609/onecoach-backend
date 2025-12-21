/**
 * Cart Service
 *
 * Gestione carrello, totali, promozioni e offerte cross/upsell.
 * Segue principi KISS/SOLID: una singola responsabilità per operazioni di cart.
 */
import type { CartItemType, cart_items, carts } from '@prisma/client';
export type CartItemInput = {
    itemType: CartItemType;
    itemId: string;
    quantity?: number;
};
export type CartWithItems = carts & {
    cart_items: cart_items[];
};
declare class CartService {
    /**
     * Restituisce il carrello attivo dell'utente, creandolo se non esiste.
     */
    getOrCreateCart(userId: string): Promise<CartWithItems>;
    /**
     * Recupera un carrello per ID garantendo l'appartenenza all'utente.
     */
    getCart(cartId: string, userId: string): Promise<CartWithItems | null>;
    /**
     * Aggiunge o aggiorna un item nel carrello.
     */
    addOrUpdateItem(userId: string, input: CartItemInput): Promise<CartWithItems>;
    /**
     * Aggiorna la quantità di un item.
     */
    updateQuantity(userId: string, itemType: CartItemType, itemId: string, quantity: number): Promise<CartWithItems>;
    /**
     * Rimuove un item dal carrello.
     */
    removeItem(userId: string, itemType: CartItemType, itemId: string): Promise<CartWithItems>;
    /**
     * Pulisce il carrello.
     */
    clear(userId: string): Promise<CartWithItems>;
    /**
     * Applica un codice promo sul carrello (sconto immediato se STRIPE_COUPON).
     */
    applyPromo(userId: string, promoCode: string | null): Promise<CartWithItems>;
    /**
     * Attacca un referral code al carrello.
     */
    attachReferral(userId: string, referralCode: string | null): Promise<CartWithItems>;
    /**
     * Recupera offerte cross/upsell attive filtrate per condizioni base.
     */
    getActiveOffers(cart: CartWithItems): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.CheckoutOfferType;
        priority: number;
        createdBy: string;
        isActive: boolean;
        placement: import("@prisma/client").$Enums.CheckoutOfferPlacement;
        audience: import("@prisma/client/runtime/client").JsonValue | null;
        conditions: import("@prisma/client/runtime/client").JsonValue | null;
        offerPayload: import("@prisma/client/runtime/client").JsonValue | null;
        layout: import("@prisma/client/runtime/client").JsonValue | null;
        ctaLabel: string | null;
        startsAt: Date | null;
        endsAt: Date | null;
    }[]>;
    /**
     * Recalcola totali tenendo conto di eventuali promo.
     */
    private recalculate;
    /**
     * Valuta le condizioni di una regola (subset minimo: minSubtotal, includeItems, excludeItems).
     */
    private evaluateRule;
    /**
     * Risolve metadati e prezzo per un item.
     */
    private resolveItem;
}
export declare const cartService: CartService;
export {};
