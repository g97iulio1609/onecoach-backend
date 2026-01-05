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
import type { Adaptations, CompleteMacros, Macros, MealType, NutritionWeek, PersonalizedPlan, NutritionUserProfile } from '@onecoach/types';
/**
 * Convert Macros to Prisma Json format (type-safe)
 *
 * @param macros - Macros object to convert
 * @returns Prisma.InputJsonValue for use in Prisma create/update operations
 */
export declare function toPrismaJsonMacros(macros: Macros): Prisma.InputJsonValue;
/**
 * Convert CompleteMacros to Prisma Json format (type-safe)
 *
 * @param macros - CompleteMacros object (with required fiber) to convert
 * @returns Prisma.InputJsonValue for use in Prisma create/update operations
 */
export declare function toPrismaJsonCompleteMacros(macros: CompleteMacros): Prisma.InputJsonValue;
/**
 * Convert NutritionWeek[] to Prisma Json format (type-safe)
 * Accepts both full NutritionWeek[] and the persistence format (without id and weeklyAverageMacros)
 *
 * @param weeks - Array of NutritionWeek objects or persistence format
 * @returns Prisma.InputJsonValue for use in Prisma create/update operations
 */
export declare function toPrismaJsonWeeks(weeks: NutritionWeek[] | Array<{
    weekNumber: number;
    notes?: string;
    days: Array<{
        dayNumber: number;
        dayName: string;
        date?: string;
        totalMacros: Macros;
        waterIntake?: number;
        notes?: string;
        meals: Array<{
            id: string;
            name: string;
            type: MealType;
            time?: string;
            notes?: string;
            totalMacros: Macros;
            foods: Array<{
                id: string;
                foodItemId: string;
                quantity: number;
                unit: string;
                notes?: string;
                done?: boolean;
                actualQuantity?: number;
                actualMacros?: Macros;
            }>;
        }>;
    }>;
}>): Prisma.InputJsonValue;
/**
 * Generic helper per Json nullable
 */
export declare function toPrismaNullableJson<T>(value: T | null): Prisma.NullableJsonNullValueInput;
export declare function toPrismaJsonPersonalizedPlan(plan: PersonalizedPlan | null): Prisma.NullableJsonNullValueInput;
export declare function toPrismaJsonAdaptations(adaptations: Adaptations | null): Prisma.NullableJsonNullValueInput;
export declare function toPrismaJsonUserProfile(userProfile: NutritionUserProfile | null): Prisma.NullableJsonNullValueInput;
/**
 * Convert metadata to Prisma Json format (type-safe, nullable)
 *
 * @param metadata - Metadata object or null
 * @returns Prisma.NullableJsonNullValueInput for use in Prisma create/update operations
 */
export declare function toPrismaJsonMetadata(metadata: Record<string, unknown> | null): Prisma.NullableJsonNullValueInput;
//# sourceMappingURL=prisma-helpers.d.ts.map