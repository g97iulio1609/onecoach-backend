/**
 * Promo Code Validation Hook
 *
 * Custom hook for validating promotion codes with debounce
 */
import type { PromotionValidationResult } from '@onecoach/lib-marketplace/promotion.service';
interface UsePromoCodeValidationOptions {
    code: string;
    userId?: string;
    enabled?: boolean;
    debounceMs?: number;
    onValidationChange?: (valid: boolean, promotion?: PromotionValidationResult['promotion']) => void;
}
export declare function usePromoCodeValidation({ code, userId, enabled, debounceMs, onValidationChange, }: UsePromoCodeValidationOptions): {
    validationResult: PromotionValidationResult;
    isValidating: boolean;
    error: string;
};
export {};
//# sourceMappingURL=use-promo-code-validation.d.ts.map