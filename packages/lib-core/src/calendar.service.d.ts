/**
 * Calendar Service
 *
 * Service layer for calendar assignments following SOLID principles.
 * - Single Responsibility: Handles only calendar assignment operations
 * - Dependency Inversion: Uses Prisma abstraction
 * - Open/Closed: Extensible for new assignment types
 */
import type { CalendarPlanType } from '@prisma/client';
/**
 * Calendar Assignment type definition
 */
export interface CalendarAssignment {
    id: string;
    userId: string;
    date: Date;
    planType: CalendarPlanType;
    planId: string;
    isRecurring: boolean;
    recurrenceRule?: RecurrenceRule | null;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Recurrence rule for repeating assignments
 */
export interface RecurrenceRule {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    interval: number;
    endDate?: string;
    count?: number;
}
/**
 * Create calendar assignment request
 */
export interface CreateCalendarAssignmentRequest {
    userId: string;
    date: Date | string;
    planType: CalendarPlanType;
    planId: string;
    isRecurring?: boolean;
    recurrenceRule?: RecurrenceRule;
}
/**
 * Update calendar assignment request
 */
export interface UpdateCalendarAssignmentRequest {
    date?: Date | string;
    planType?: CalendarPlanType;
    planId?: string;
    isRecurring?: boolean;
    recurrenceRule?: RecurrenceRule | null;
}
/**
 * Query calendar assignments request
 */
export interface QueryCalendarAssignmentsRequest {
    userId: string;
    startDate: Date | string;
    endDate: Date | string;
    planType?: CalendarPlanType;
}
/**
 * Day plan view - aggregated view of assignments for a specific day
 */
export interface DayPlanView {
    date: Date;
    nutritionAssignments: CalendarAssignment[];
    workoutAssignments: CalendarAssignment[];
    hasNutrition: boolean;
    hasWorkout: boolean;
}
/**
 * Get calendar assignments for a date range
 */
export declare function getCalendarAssignments(params: QueryCalendarAssignmentsRequest): Promise<CalendarAssignment[]>;
/**
 * Get calendar assignment by ID
 */
export declare function getCalendarAssignmentById(id: string, userId: string): Promise<CalendarAssignment | null>;
/**
 * Get assignments for a specific day
 */
export declare function getDayPlan(userId: string, date: Date | string): Promise<DayPlanView>;
/**
 * Create a calendar assignment
 */
export declare function createCalendarAssignment(data: CreateCalendarAssignmentRequest): Promise<CalendarAssignment>;
/**
 * Create multiple assignments (for date ranges) - optimized with batch operations
 */
export declare function createCalendarAssignmentRange(userId: string, startDate: Date | string, endDate: Date | string, planType: CalendarPlanType, planId: string): Promise<CalendarAssignment[]>;
/**
 * Update a calendar assignment
 */
export declare function updateCalendarAssignment(id: string, userId: string, data: UpdateCalendarAssignmentRequest): Promise<CalendarAssignment>;
/**
 * Delete a calendar assignment
 */
export declare function deleteCalendarAssignment(id: string, userId: string): Promise<void>;
/**
 * Delete assignments by plan ID (when a plan is deleted)
 */
export declare function deleteAssignmentsByPlanId(userId: string, planType: CalendarPlanType, planId: string): Promise<number>;
/**
 * Delete assignments for a date range
 */
export declare function deleteAssignmentsInRange(userId: string, startDate: Date | string, endDate: Date | string, planType?: CalendarPlanType): Promise<number>;
//# sourceMappingURL=calendar.service.d.ts.map