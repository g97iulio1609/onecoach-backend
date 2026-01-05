/**
 * Modification Service
 *
 * Centralized service for modifying nutrition plans and workout programs.
 * Handles day/week modifications with validation and atomic persistence.
 */
import type { NutritionPlan, Macros, Meal, WorkoutProgram, WorkoutWeek } from '@onecoach/types';
/**
 * Modified nutrition day data structure (from AI agent)
 */
export interface ModifiedNutritionDayData {
    dayNumber: number;
    dayName?: string;
    meals: Meal[];
    totalMacros: Macros;
    waterIntake?: number;
    notes?: string;
}
/**
 * Parameters for modifying a nutrition day
 */
export interface ModifyNutritionDayParams {
    planId: string;
    dayNumber: number;
    modifiedDayData: ModifiedNutritionDayData;
    userId: string;
}
/**
 * Parameters for modifying a workout week
 */
export interface ModifyWorkoutWeekParams {
    programId: string;
    weekNumber: number;
    modifiedWeekData: WorkoutWeek;
    userId: string;
}
/**
 * Modification Service
 * Handles all plan/program modifications with atomic persistence
 */
export declare class ModificationService {
    /**
     * Modify a specific day in a nutrition plan
     */
    static modifyNutritionDay(params: ModifyNutritionDayParams): Promise<NutritionPlan>;
    /**
     * Modify a specific week in a workout program
     */
    static modifyWorkoutWeek(params: ModifyWorkoutWeekParams): Promise<WorkoutProgram>;
}
//# sourceMappingURL=modification.service.d.ts.map