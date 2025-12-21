/**
 * Nutrition Type Guards
 *
 * Type-safe runtime validation for nutrition data structures.
 * Used to validate Json fields from Prisma and unknown data from external sources.
 */
import { MacrosSchema, CompleteMacrosSchema, FoodSchema, MealSchema, NutritionDaySchema, NutritionWeekSchema, } from '@onecoach/schemas';
/**
 * Macros type guard
 */
export function isMacros(value) {
    if (!value || typeof value !== 'object')
        return false;
    const m = value;
    return (typeof m.calories === 'number' &&
        typeof m.protein === 'number' &&
        typeof m.carbs === 'number' &&
        typeof m.fats === 'number' &&
        (m.fiber === undefined || typeof m.fiber === 'number'));
}
/**
 * Complete Macros type guard (with required fiber)
 */
export function isCompleteMacros(value) {
    if (!isMacros(value))
        return false;
    return typeof value.fiber === 'number';
}
/**
 * Food type guard
 * Uses Zod schema for validation to ensure consistency
 */
export function isFood(value) {
    if (!value || typeof value !== 'object')
        return false;
    // Use Zod schema for validation (more reliable than manual checks)
    const result = FoodSchema.safeParse(value);
    return result.success;
}
/**
 * Meal type guard
 * Uses Zod schema for validation to ensure consistency
 */
export function isMeal(value) {
    if (!value || typeof value !== 'object')
        return false;
    // Use Zod schema for validation (more reliable than manual checks)
    const result = MealSchema.safeParse(value);
    return result.success;
}
/**
 * NutritionDay type guard
 * Uses Zod schema for validation to ensure consistency
 */
export function isNutritionDay(value) {
    if (!value || typeof value !== 'object')
        return false;
    // Use Zod schema for validation (more reliable than manual checks)
    const result = NutritionDaySchema.safeParse(value);
    return result.success;
}
/**
 * NutritionWeek type guard
 * Uses Zod schema for validation to ensure consistency
 */
export function isNutritionWeek(value) {
    if (!value || typeof value !== 'object')
        return false;
    // Use Zod schema for validation (more reliable than manual checks)
    const result = NutritionWeekSchema.safeParse(value);
    return result.success;
}
/**
 * Array of NutritionWeek type guard
 */
export function isNutritionWeekArray(value) {
    return Array.isArray(value) && value.every((w) => isNutritionWeek(w));
}
/**
 * Zod schema for Macros (for runtime validation)
 */
export const MacrosZodSchema = MacrosSchema;
/**
 * Zod schema for Complete Macros (with required fiber)
 */
export const CompleteMacrosZodSchema = CompleteMacrosSchema;
/**
 * Validate and parse Macros from unknown value
 */
export function parseMacrosSafe(value) {
    const result = MacrosZodSchema.safeParse(value);
    if (result.success) {
        return result.data;
    }
    throw new Error(`Invalid Macros: ${result.error.message}`);
}
/**
 * Validate and parse Complete Macros from unknown value
 */
export function parseCompleteMacrosSafe(value) {
    const result = CompleteMacrosZodSchema.safeParse(value);
    if (result.success) {
        return result.data;
    }
    // Fallback: try base macros and default fiber to 0 to keep schema consistent
    const base = MacrosZodSchema.parse(value ?? {});
    return { ...base, fiber: base.fiber ?? 0 };
}
/**
 * Type guard for PersonalizedPlan
 */
export function isPersonalizedPlan(value) {
    if (!value || typeof value !== 'object')
        return false;
    const p = value;
    return (Array.isArray(p.customizations) &&
        Array.isArray(p.personalNotes) &&
        (p.motivationalMessage === undefined || typeof p.motivationalMessage === 'string'));
}
/**
 * Type guard for Adaptations
 */
export function isAdaptations(value) {
    if (!value || typeof value !== 'object')
        return false;
    const a = value;
    return ((a.mealTimingAdjustments === undefined || Array.isArray(a.mealTimingAdjustments)) &&
        (a.portionAdjustments === undefined || Array.isArray(a.portionAdjustments)) &&
        (a.substitutions === undefined || Array.isArray(a.substitutions)));
}
/**
 * Type guard for metadata (Record<string, unknown> | null)
 */
export function isMetadata(value) {
    return value === null || (typeof value === 'object' && !Array.isArray(value));
}
