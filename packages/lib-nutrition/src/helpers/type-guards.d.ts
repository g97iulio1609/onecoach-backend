/**
 * Nutrition Type Guards
 *
 * Type-safe runtime validation for nutrition data structures.
 * Used to validate Json fields from Prisma and unknown data from external sources.
 */
import type { Macros, NutritionWeek, NutritionDay, Meal, Food, PersonalizedPlan, Adaptations } from '@onecoach/types';
/**
 * Macros type guard
 */
export declare function isMacros(value: unknown): value is Macros;
/**
 * Complete Macros type guard (with required fiber)
 */
export declare function isCompleteMacros(value: unknown): value is Macros & {
    fiber: number;
};
/**
 * Food type guard
 * Uses Zod schema for validation to ensure consistency
 */
export declare function isFood(value: unknown): value is Food;
/**
 * Meal type guard
 * Uses Zod schema for validation to ensure consistency
 */
export declare function isMeal(value: unknown): value is Meal;
/**
 * NutritionDay type guard
 * Uses Zod schema for validation to ensure consistency
 */
export declare function isNutritionDay(value: unknown): value is NutritionDay;
/**
 * NutritionWeek type guard
 * Uses Zod schema for validation to ensure consistency
 */
export declare function isNutritionWeek(value: unknown): value is NutritionWeek;
/**
 * Array of NutritionWeek type guard
 */
export declare function isNutritionWeekArray(value: unknown): value is NutritionWeek[];
/**
 * Zod schema for Macros (for runtime validation)
 */
export declare const MacrosZodSchema: import("zod").ZodObject<{
    calories: import("zod").ZodNumber;
    protein: import("zod").ZodNumber;
    carbs: import("zod").ZodNumber;
    fats: import("zod").ZodNumber;
    fiber: import("zod").ZodOptional<import("zod").ZodNumber>;
}, import("zod/v4/core").$strip>;
/**
 * Zod schema for Complete Macros (with required fiber)
 */
export declare const CompleteMacrosZodSchema: import("zod").ZodObject<{
    calories: import("zod").ZodNumber;
    protein: import("zod").ZodNumber;
    carbs: import("zod").ZodNumber;
    fats: import("zod").ZodNumber;
    fiber: import("zod").ZodNumber;
}, import("zod/v4/core").$strip>;
/**
 * Validate and parse Macros from unknown value
 */
export declare function parseMacrosSafe(value: unknown): Macros;
/**
 * Validate and parse Complete Macros from unknown value
 */
export declare function parseCompleteMacrosSafe(value: unknown): Macros & {
    fiber: number;
};
/**
 * Type guard for PersonalizedPlan
 */
export declare function isPersonalizedPlan(value: unknown): value is PersonalizedPlan;
/**
 * Type guard for Adaptations
 */
export declare function isAdaptations(value: unknown): value is Adaptations;
/**
 * Type guard for metadata (Record<string, unknown> | null)
 */
export declare function isMetadata(value: unknown): value is Record<string, unknown> | null;
