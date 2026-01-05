/**
 * Plan Operations - Pure Functions
 *
 * Funzioni pure per operazioni CRUD su piani nutrizionali
 * Segue principi KISS, DRY, SOLID
 */
import type { NutritionPlan, NutritionDay, Meal, Food } from '@onecoach/types';
/**
 * Aggiunge una nuova settimana al piano
 */
export declare function addNutritionWeek(plan: NutritionPlan): {
    plan: NutritionPlan;
    weekNumber: number;
};
/**
 * Rimuove una settimana dal piano e rinumera le rimanenti
 */
export declare function removeWeek(plan: NutritionPlan, weekNumber: number): NutritionPlan;
/**
 * Aggiunge un giorno al piano (aggiunge all'ultima settimana o crea nuova)
 */
export declare function addDay(plan: NutritionPlan): {
    plan: NutritionPlan;
    weekNumber: number;
    dayNumber: number;
};
/**
 * Rimuove un giorno dal piano e rinumera i giorni rimanenti
 */
export declare function removeDay(plan: NutritionPlan, dayNumber: number): NutritionPlan;
/**
 * Aggiunge un pasto a un giorno
 */
export declare function addMeal(plan: NutritionPlan, dayNumber: number, templateMeal?: Meal): NutritionPlan;
/**
 * Rimuove un pasto da un giorno
 */
export declare function removeMeal(plan: NutritionPlan, dayNumber: number, mealId: string): NutritionPlan;
/**
 * Aggiunge un alimento a un pasto
 */
export declare function addFood(plan: NutritionPlan, dayNumber: number, mealId: string, food: Food): NutritionPlan;
/**
 * Rimuove un alimento da un pasto
 */
export declare function removeFood(plan: NutritionPlan, dayNumber: number, mealId: string, foodId: string): NutritionPlan;
/**
 * Aggiorna un alimento in un pasto
 */
export declare function updateFood(plan: NutritionPlan, dayNumber: number, mealId: string, foodId: string, updates: Partial<Food>): NutritionPlan;
/**
 * Aggiorna un giorno usando un updater function
 */
export declare function updateDay(plan: NutritionPlan, dayNumber: number, updater: (day: NutritionDay) => NutritionDay): NutritionPlan;
//# sourceMappingURL=plan-operations.d.ts.map