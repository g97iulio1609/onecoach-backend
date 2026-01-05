/**
 * Nutrition Summary Normalizer
 *
 * Normalizer leggero per le liste di piani nutrizionali.
 * Esclude i campi JSON pesanti (weeks, personalizedPlan, adaptations) per migliorare le performance.
 */
import { NutritionStatus } from '@onecoach/types/client';
/**
 * Interfaccia per il riepilogo del piano nutrizionale
 */
export interface NutritionPlanSummary {
    id: string;
    name: string;
    description: string;
    goals: string[];
    durationWeeks: number;
    status: NutritionStatus;
    createdAt: string;
    updatedAt: string;
    userId: string;
}
/**
 * Interfaccia Prisma per il riepilogo (ottimizzata con select)
 */
export interface PrismaNutritionPlanSummary {
    id: string;
    name: string;
    description: string | null;
    goals: unknown;
    durationWeeks: number;
    status: NutritionStatus;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
}
/**
 * Normalizza un piano nutrizionale per la visualizzazione in lista.
 * Evita il parsing di campi JSON pesanti.
 */
export declare function normalizeNutritionPlanSummary(plan: PrismaNutritionPlanSummary): NutritionPlanSummary;
//# sourceMappingURL=nutrition-summary-normalizer.d.ts.map