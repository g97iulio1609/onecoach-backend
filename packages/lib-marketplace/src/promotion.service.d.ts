/**
 * Promotion Service
 *
 * Gestione promozioni: codici Stripe coupon e bonus crediti
 * Segue principi KISS, SOLID, DRY
 */
import type { PromotionType, DiscountType } from '@prisma/client';
import { Prisma } from '@prisma/client';
export interface CreatePromotionParams {
    code: string;
    type: PromotionType;
    stripeCouponId?: string;
    discountType?: DiscountType;
    discountValue?: number;
    bonusCredits?: number;
    maxUses?: number;
    maxUsesPerUser?: number;
    validFrom: Date;
    validUntil?: Date;
    description?: string;
    createdBy: string;
}
export interface PromotionValidationResult {
    valid: boolean;
    promotion?: {
        id: string;
        code: string;
        type: PromotionType;
        discountType?: DiscountType;
        discountValue?: number;
        bonusCredits?: number;
        description?: string;
    };
    error?: string;
}
export interface ApplyPromotionResult {
    success: boolean;
    promotionId?: string;
    stripeCouponId?: string;
    bonusCredits?: number;
    error?: string;
}
/**
 * Promotion Service
 */
export declare class PromotionService {
    /**
     * Crea una nuova promozione
     */
    static createPromotion(params: CreatePromotionParams): Promise<string>;
    /**
     * Valida un codice promozionale per un utente
     */
    static validatePromotionCode(code: string, userId?: string): Promise<PromotionValidationResult>;
    /**
     * Recupera promozione per codice
     */
    static getPromotionByCode(code: string): Promise<{
        id: string;
        description: string | null;
        type: import("@prisma/client").$Enums.PromotionType;
        code: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        createdBy: string;
        stripeCouponId: string | null;
        discountType: import("@prisma/client").$Enums.DiscountType | null;
        discountValue: Prisma.Decimal | null;
        bonusCredits: number | null;
        maxUses: number | null;
        maxUsesPerUser: number;
        validFrom: Date;
        validUntil: Date | null;
    } | null>;
    /**
     * Conta usi di una promozione per utente
     */
    static getUserPromotionUses(promotionId: string, userId: string): Promise<number>;
    /**
     * Applica bonus crediti manualmente
     */
    static applyBonusCredits(promotionId: string, userId: string, appliedBy?: string): Promise<void>;
    /**
     * Registra uso promozione
     */
    static recordPromotionUse(params: {
        promotionId: string;
        userId: string;
        paymentId?: string;
        stripeCheckoutSessionId?: string;
        metadata?: Record<string, unknown>;
    }): Promise<void>;
    /**
     * Applica promozione a checkout session Stripe
     * Restituisce configurazione per checkout session
     */
    static applyPromotionToCheckout(code: string, userId: string): Promise<ApplyPromotionResult>;
}
//# sourceMappingURL=promotion.service.d.ts.map