/**
 * Macro Validation Service
 *
 * Centralized service for macro validation and coherence checking.
 */
import { type Macros, type MacroCoherenceResult } from '@onecoach/lib-shared';
/**
 * Validation result for Atwater formula
 */
export interface AtwaterValidationResult {
    valid: boolean;
    expectedCalories: number;
    actualCalories: number;
    difference: number;
    differencePercent: number;
    message: string;
}
/**
 * Structure for meal validation
 */
interface MealStructure {
    name: string;
    foods: Macros[];
    expectedMealMacros: Macros;
}
/**
 * Hierarchical validation result for foods → meal → daily
 */
export interface HierarchicalValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    details: {
        foodsToMeal?: MacroCoherenceResult;
        mealsToDaily?: MacroCoherenceResult;
        atwaterChecks?: AtwaterValidationResult[];
    };
}
/**
 * MacroValidationService
 */
export declare class MacroValidationService {
    static validateAtwaterFormula(macros: Macros, tolerance?: number): AtwaterValidationResult;
    static validateFoodsToMeal(foodMacros: Macros[], mealMacros: Macros, tolerance?: number, context?: string): MacroCoherenceResult;
    static validateMealsToTotal(mealMacros: Macros[], totalMacros: Macros, tolerance?: number, context?: string): MacroCoherenceResult;
    static validateMealsToDaily(mealMacros: Macros[], totalMacros: Macros, tolerance?: number, context?: string): MacroCoherenceResult;
    static validateHierarchy(structure: {
        meals: MealStructure[];
        expectedDailyMacros: Macros;
    }, tolerance?: number): HierarchicalValidationResult;
    static validateAgainstTarget(actual: Macros, target: Macros, tolerance?: number, context?: string): MacroCoherenceResult;
}
export {};
