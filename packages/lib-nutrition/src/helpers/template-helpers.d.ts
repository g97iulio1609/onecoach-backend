/**
 * Template Helpers - Pure Functions
 *
 * Helper per gestione template (estrazione dati, re-ID, etc.)
 * Segue principi KISS, DRY, SOLID
 */
import type { NutritionTemplate, NutritionTemplateType, Meal, NutritionDay, NutritionWeek } from '@onecoach/types';
/**
 * Estrae dati template in base al tipo
 */
export declare function extractTemplateData(template: NutritionTemplate): Meal | NutritionDay | NutritionWeek;
/**
 * Re-ID tutti i pasti e alimenti in un template per evitare conflitti
 */
export declare function reIdTemplateData<T extends Meal | NutritionDay | NutritionWeek>(data: T, type: NutritionTemplateType): T;
//# sourceMappingURL=template-helpers.d.ts.map