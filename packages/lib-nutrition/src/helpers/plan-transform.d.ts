/**
 * Nutrition Plan Transform Utilities
 *
 * Clean, refactored version without backward compatibility.
 * Follows KISS, SOLID, DRY principles.
 * FORCE INVALIDATION 123
 */
import { NutritionStatus } from '@onecoach/types/client';
export type PrismaNutritionPlan = {
    id: string;
    name: string;
    description: string | null;
    goals: unknown;
    durationWeeks: number;
    targetMacros: unknown;
    userProfile: unknown;
    weeks: unknown;
    restrictions: unknown;
    preferences: unknown;
    status: NutritionStatus;
    metadata: unknown;
    personalizedPlan: unknown;
    adaptations: unknown;
    createdAt: Date;
    updatedAt: Date;
    version: number;
    userId: string;
};
import type { NutritionPlan, NutritionWeek, NutritionDay, Macros, CompleteMacros, MealType, PersonalizedPlan, Adaptations, NutritionUserProfile } from '@onecoach/types';
/**
 * Parse and validate NutritionStatus from string or enum value
 */
export declare function parseNutritionStatus(value: unknown): NutritionStatus;
export declare function normalizeNutritionPlan(plan: PrismaNutritionPlan): NutritionPlan;
/**
 * Prepara piano per persistenza
 * REFACTORED: Salva solo foodItemId + quantity (macros calcolati on-demand)
 * TYPE-SAFE: Usa type guards invece di any
 */
export declare function preparePlanForPersistence(plan: NutritionPlan): {
    name: string;
    description: string;
    goals: string[];
    durationWeeks: number;
    targetMacros: CompleteMacros;
    userProfile: NutritionUserProfile | null;
    personalizedPlan: PersonalizedPlan | null;
    adaptations: Adaptations | null;
    weeks: Array<{
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
    }>;
    restrictions: string[];
    preferences: string[];
    status: NutritionStatus;
    metadata: Record<string, unknown> | null;
};
export declare function createEmptyDay(dayNumber: number): NutritionDay;
export declare function createEmptyWeek(weekNumber: number): NutritionWeek;
export declare function createEmptyPlan(userId?: string): NutritionPlan;
/**
 * Normalize agent payload to NutritionPlan
 * Uses Zod validation for type safety and consistency
 */
export declare function normalizeAgentPayload(payload: unknown, base?: Partial<NutritionPlan>): NutritionPlan;
//# sourceMappingURL=plan-transform.d.ts.map