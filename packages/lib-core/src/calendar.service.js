/**
 * Calendar Service
 *
 * Service layer for calendar assignments following SOLID principles.
 * - Single Responsibility: Handles only calendar assignment operations
 * - Dependency Inversion: Uses Prisma abstraction
 * - Open/Closed: Extensible for new assignment types
 */
import { prisma } from './prisma';
import { Prisma } from '@prisma/client';
/**
 * Get calendar assignments for a date range
 */
export async function getCalendarAssignments(params) {
    const { userId, startDate, endDate, planType } = params;
    const assignments = await prisma.calendar_assignments.findMany({
        where: {
            userId,
            date: {
                gte: new Date(startDate),
                lte: new Date(endDate),
            },
            ...(planType && { planType }),
        },
        orderBy: {
            date: 'asc',
        },
    });
    return assignments.map(mapToCalendarAssignment);
}
/**
 * Get calendar assignment by ID
 */
export async function getCalendarAssignmentById(id, userId) {
    const assignment = await prisma.calendar_assignments.findFirst({
        where: {
            id,
            userId,
        },
    });
    return assignment ? mapToCalendarAssignment(assignment) : null;
}
/**
 * Get assignments for a specific day
 */
export async function getDayPlan(userId, date) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const assignments = await prisma.calendar_assignments.findMany({
        where: {
            userId,
            date: targetDate,
        },
    });
    const mapped = assignments.map(mapToCalendarAssignment);
    return {
        date: targetDate,
        nutritionAssignments: mapped.filter((a) => a.planType === 'NUTRITION'),
        workoutAssignments: mapped.filter((a) => a.planType === 'WORKOUT'),
        hasNutrition: mapped.some((a) => a.planType === 'NUTRITION'),
        hasWorkout: mapped.some((a) => a.planType === 'WORKOUT'),
    };
}
/**
 * Create a calendar assignment
 */
export async function createCalendarAssignment(data) {
    const targetDate = new Date(data.date);
    targetDate.setHours(0, 0, 0, 0);
    const assignment = await prisma.calendar_assignments.create({
        data: {
            userId: data.userId,
            date: targetDate,
            planType: data.planType,
            planId: data.planId,
            isRecurring: data.isRecurring ?? false,
            recurrenceRule: data.recurrenceRule,
        },
    });
    return mapToCalendarAssignment(assignment);
}
/**
 * Create multiple assignments (for date ranges) - optimized with batch operations
 */
export async function createCalendarAssignmentRange(userId, startDate, endDate, planType, planId) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const dates = [];
    const current = new Date(start);
    while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    // Use transaction with deleteMany + createMany for better performance
    // This is more efficient than N individual upserts
    const assignments = await prisma.$transaction(async (tx) => {
        // First, delete any existing assignments for this range
        await tx.calendar_assignments.deleteMany({
            where: {
                userId,
                planType,
                planId,
                date: {
                    gte: start,
                    lte: end,
                },
            },
        });
        // Then create all new assignments in a single batch
        await tx.calendar_assignments.createMany({
            data: dates.map((date) => ({
                userId,
                date,
                planType,
                planId,
                isRecurring: false,
            })),
        });
        // Fetch the created assignments to return them
        return tx.calendar_assignments.findMany({
            where: {
                userId,
                planType,
                planId,
                date: {
                    gte: start,
                    lte: end,
                },
            },
            orderBy: { date: 'asc' },
        });
    });
    return assignments.map(mapToCalendarAssignment);
}
/**
 * Update a calendar assignment
 */
export async function updateCalendarAssignment(id, userId, data) {
    // Verify ownership
    const existing = await prisma.calendar_assignments.findFirst({
        where: { id, userId },
    });
    if (!existing) {
        throw new Error('Calendar assignment not found or access denied');
    }
    const updateData = {};
    if (data.date !== undefined) {
        const targetDate = new Date(data.date);
        targetDate.setHours(0, 0, 0, 0);
        updateData.date = targetDate;
    }
    if (data.planType !== undefined)
        updateData.planType = data.planType;
    if (data.planId !== undefined)
        updateData.planId = data.planId;
    if (data.isRecurring !== undefined)
        updateData.isRecurring = data.isRecurring;
    if (data.recurrenceRule !== undefined) {
        updateData.recurrenceRule = data.recurrenceRule;
    }
    const assignment = await prisma.calendar_assignments.update({
        where: { id },
        data: updateData,
    });
    return mapToCalendarAssignment(assignment);
}
/**
 * Delete a calendar assignment
 */
export async function deleteCalendarAssignment(id, userId) {
    // Verify ownership
    const existing = await prisma.calendar_assignments.findFirst({
        where: { id, userId },
    });
    if (!existing) {
        throw new Error('Calendar assignment not found or access denied');
    }
    await prisma.calendar_assignments.delete({
        where: { id },
    });
}
/**
 * Delete assignments by plan ID (when a plan is deleted)
 */
export async function deleteAssignmentsByPlanId(userId, planType, planId) {
    const result = await prisma.calendar_assignments.deleteMany({
        where: {
            userId,
            planType,
            planId,
        },
    });
    return result.count;
}
/**
 * Delete assignments for a date range
 */
export async function deleteAssignmentsInRange(userId, startDate, endDate, planType) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const result = await prisma.calendar_assignments.deleteMany({
        where: {
            userId,
            date: {
                gte: start,
                lte: end,
            },
            ...(planType && { planType }),
        },
    });
    return result.count;
}
/**
 * Map Prisma model to service type
 * (Dependency Inversion Principle - isolate from Prisma types)
 */
function mapToCalendarAssignment(assignment) {
    return {
        id: assignment.id,
        userId: assignment.userId ?? '',
        date: assignment.date,
        planType: assignment.planType,
        planId: assignment.planId ?? '',
        isRecurring: assignment.isRecurring,
        recurrenceRule: assignment.recurrenceRule,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
    };
}
