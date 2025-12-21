/**
 * Prisma Helper Functions
 *
 * Type-safe helpers for converting nutrition data to Prisma Json format.
 * Eliminates unsafe type assertions in API routes.
 *
 * NOTE: The `as unknown as Prisma.InputJsonValue` assertions are necessary
 * because Prisma's Json type is a branded type that requires explicit conversion.
 * These helpers ensure type safety at the call site while maintaining Prisma compatibility.
 */
import { Prisma } from '@onecoach/types';
/**
 * Convert Macros to Prisma Json format (type-safe)
 *
 * @param macros - Macros object to convert
 * @returns Prisma.InputJsonValue for use in Prisma create/update operations
 */
export function toPrismaJsonMacros(macros) {
    // Type assertion is safe: Macros is a plain object compatible with Json
    return macros;
}
/**
 * Convert CompleteMacros to Prisma Json format (type-safe)
 *
 * @param macros - CompleteMacros object (with required fiber) to convert
 * @returns Prisma.InputJsonValue for use in Prisma create/update operations
 */
export function toPrismaJsonCompleteMacros(macros) {
    // Type assertion is safe: CompleteMacros is a plain object compatible with Json
    return macros;
}
/**
 * Convert NutritionWeek[] to Prisma Json format (type-safe)
 * Accepts both full NutritionWeek[] and the persistence format (without id and weeklyAverageMacros)
 *
 * @param weeks - Array of NutritionWeek objects or persistence format
 * @returns Prisma.InputJsonValue for use in Prisma create/update operations
 */
export function toPrismaJsonWeeks(weeks) {
    // Type assertion is safe: NutritionWeek[] is a plain array of objects compatible with Json
    return weeks;
}
/**
 * Generic helper per Json nullable
 */
export function toPrismaNullableJson(value) {
    if (value === null) {
        return Prisma.JsonNull;
    }
    return value;
}
export function toPrismaJsonPersonalizedPlan(plan) {
    return toPrismaNullableJson(plan);
}
export function toPrismaJsonAdaptations(adaptations) {
    return toPrismaNullableJson(adaptations);
}
export function toPrismaJsonUserProfile(userProfile) {
    return toPrismaNullableJson(userProfile);
}
/**
 * Convert metadata to Prisma Json format (type-safe, nullable)
 *
 * @param metadata - Metadata object or null
 * @returns Prisma.NullableJsonNullValueInput for use in Prisma create/update operations
 */
export function toPrismaJsonMetadata(metadata) {
    return toPrismaNullableJson(metadata);
}
