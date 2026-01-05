/**
 * Nutrition Summary Normalizer
 *
 * Normalizer leggero per le liste di piani nutrizionali.
 * Esclude i campi JSON pesanti (weeks, personalizedPlan, adaptations) per migliorare le performance.
 */
import { NutritionStatus } from '@onecoach/types/client';
import { parseNutritionStatus } from '../plan-transform';
/**
 * Normalizza un piano nutrizionale per la visualizzazione in lista.
 * Evita il parsing di campi JSON pesanti.
 */
export function normalizeNutritionPlanSummary(plan) {
    const goals = Array.isArray(plan.goals)
        ? plan.goals.filter((g) => typeof g === 'string')
        : ['MAINTENANCE'];
    return {
        id: plan.id,
        name: plan.name || 'Untitled Plan',
        description: plan.description || '',
        goals: goals.length > 0 ? goals : ['MAINTENANCE'],
        durationWeeks: plan.durationWeeks || 1,
        status: parseNutritionStatus(plan.status),
        createdAt: plan.createdAt.toISOString(),
        updatedAt: plan.updatedAt.toISOString(),
        userId: plan.userId,
    };
}
