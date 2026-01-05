/**
 * Plan Sync - Pure Functions
 *
 * Funzioni pure per sincronizzare e preparare piani per il salvataggio
 * Segue principi KISS, DRY, SOLID
 */
import type { NutritionPlan } from '@onecoach/types';
/**
 * Sincronizza piano per il salvataggio
 * Normalizza tutti i valori numerici, calcola macro totali, pulisce array
 */
export declare function syncPlanForSave(planToSync: NutritionPlan): NutritionPlan;
//# sourceMappingURL=plan-sync.d.ts.map