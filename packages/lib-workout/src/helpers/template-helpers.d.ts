/**
 * Workout Template Helpers - Pure Functions
 *
 * Helper per gestione template workout (estrazione dati, re-ID, etc.)
 * Segue principi KISS, DRY, SOLID
 *
 * SSOT: Usa SOLO setGroups per le serie, non exercise.sets legacy.
 */
import type { WorkoutTemplate, WorkoutTemplateType, Exercise, WorkoutDay, WorkoutWeek } from '@onecoach/types';
/**
 * Estrae dati template in base al tipo
 */
export declare function extractTemplateData(template: WorkoutTemplate): Exercise | WorkoutDay | WorkoutWeek;
/**
 * Re-ID tutti gli esercizi, giorni e settimane in un template per evitare conflitti
 */
export declare function reIdTemplateData<T extends Exercise | WorkoutDay | WorkoutWeek>(data: T, type: WorkoutTemplateType): T;
//# sourceMappingURL=template-helpers.d.ts.map