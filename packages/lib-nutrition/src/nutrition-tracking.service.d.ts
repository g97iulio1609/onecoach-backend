/**
 * Nutrition Tracking Service
 *
 * Service layer for managing nutrition day log tracking.
 * Handles CRUD operations for NutritionDayLog entities.
 *
 * Follows SOLID principles:
 * - Single Responsibility: Only manages nutrition day log data
 * - Open/Closed: Extendable without modification
 * - Dependency Inversion: Depends on Prisma abstraction
 */
import type { NutritionDayLog, CreateNutritionDayLogRequest, UpdateNutritionDayLogRequest, NutritionPlanStats, Macros } from '@onecoach/types';
/**
 * Create a new nutrition day log
 *
 * Initializes a log with the meals from the specified plan day.
 * Log starts with all tracking fields empty (to be filled by user).
 */
export declare function createNutritionDayLog(userId: string, request: CreateNutritionDayLogRequest): Promise<NutritionDayLog>;
/**
 * Get a nutrition day log by ID
 */
export declare function getNutritionDayLog(logId: string, userId: string): Promise<NutritionDayLog | null>;
/**
 * Get all nutrition day logs for a user
 *
 * @param userId - User ID
 * @param planId - Optional filter by plan ID
 * @param limit - Max number of logs to return
 */
export declare function getNutritionDayLogs(userId: string, planId?: string, limit?: number): Promise<NutritionDayLog[]>;
/**
 * Get all logs for a specific nutrition plan
 */
export declare function getPlanLogs(planId: string, userId: string): Promise<NutritionDayLog[]>;
/**
 * Get log for a specific day
 */
export declare function getLogForDay(userId: string, planId: string, weekNumber: number, dayNumber: number, date?: Date): Promise<NutritionDayLog | null>;
/**
 * Update a nutrition day log
 *
 * Typically called during or after meals to update tracking data.
 */
export declare function updateNutritionDayLog(logId: string, userId: string, updates: UpdateNutritionDayLogRequest): Promise<NutritionDayLog>;
/**
 * Delete a nutrition day log
 */
export declare function deleteNutritionDayLog(logId: string, userId: string): Promise<void>;
/**
 * Get nutrition plan statistics
 *
 * Calculates adherence rate, average macros, etc. for a plan.
 */
export declare function getNutritionPlanStats(planId: string, userId: string): Promise<NutritionPlanStats>;
/**
 * Calculate actual daily macros from meals
 *
 * Helper function to sum up macros from all foods in meals.
 * Uses actualMacros if present, otherwise uses planned macros.
 */
export declare function calculateActualDailyMacros(meals: Array<Record<string, unknown>>): Macros;
