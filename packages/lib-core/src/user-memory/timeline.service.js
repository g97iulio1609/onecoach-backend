/**
 * Timeline Service
 *
 * Auto-tracking service for significant user events.
 * KISS: Simple event detection and creation
 * SOLID: Single responsibility - only timeline management
 */
import { prisma } from '../prisma';
import { createId } from '@onecoach/lib-shared/id-generator';
import { Prisma } from '@prisma/client';
/**
 * Timeline Service
 */
export class TimelineService {
    /**
     * Create timeline event
     */
    async createEvent(userId, event) {
        const timelineEvent = await prisma.user_memory_timeline.create({
            data: {
                id: createId(),
                userId,
                eventType: event.eventType,
                domain: event.domain || null,
                title: event.title,
                description: event.description || null,
                data: event.data || Prisma.JsonNull,
                date: new Date(event.date),
            },
        });
        return {
            id: timelineEvent.id,
            userId: timelineEvent.userId,
            eventType: timelineEvent.eventType,
            domain: timelineEvent.domain,
            title: timelineEvent.title,
            description: timelineEvent.description || undefined,
            data: timelineEvent.data,
            date: timelineEvent.date.toISOString().split('T')[0],
            createdAt: timelineEvent.createdAt.toISOString(),
        };
    }
    /**
     * Auto-detect weight progress (significant changes)
     */
    async detectWeightProgress(userId) {
        // Get last 2 body measurements
        const measurements = await prisma.body_measurements.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 2,
        });
        if (measurements.length < 2)
            return;
        const latest = measurements[0];
        const previous = measurements[1];
        if (!latest.weight || !previous.weight)
            return;
        const weightDiff = Number(latest.weight) - Number(previous.weight);
        const daysDiff = Math.floor((latest.date.getTime() - previous.date.getTime()) / (1000 * 60 * 60 * 24));
        // Significant change: > 2kg in < 60 days
        if (Math.abs(weightDiff) >= 2 && daysDiff <= 60) {
            const eventType = weightDiff < 0 ? 'progress' : 'progress';
            const progressType = weightDiff < 0 ? 'weight_loss' : 'weight_gain';
            // Check if event already exists for this period
            const existing = await prisma.user_memory_timeline.findFirst({
                where: {
                    userId,
                    eventType: 'progress',
                    domain: 'general',
                    date: latest.date,
                    title: { contains: weightDiff < 0 ? 'Dimagrimento' : 'Aumento peso' },
                },
            });
            if (!existing) {
                await this.createEvent(userId, {
                    eventType,
                    domain: 'general',
                    title: weightDiff < 0
                        ? `Dimagrimento di ${Math.abs(weightDiff).toFixed(1)}kg`
                        : `Aumento peso di ${weightDiff.toFixed(1)}kg`,
                    description: `Da ${Number(previous.weight).toFixed(1)}kg a ${Number(latest.weight).toFixed(1)}kg in ${daysDiff} giorni`,
                    data: {
                        type: progressType,
                        value: Math.abs(weightDiff),
                        unit: 'kg',
                        previousValue: Number(previous.weight),
                        period: `${daysDiff} giorni`,
                    },
                    date: latest.date.toISOString().split('T')[0],
                });
            }
        }
    }
    /**
     * Track injury from health notes or user input
     */
    async trackInjury(userId, bodyPart, severity, notes) {
        await this.createEvent(userId, {
            eventType: 'injury',
            domain: 'workout',
            title: `Infortunio: ${bodyPart}`,
            description: notes || `Infortunio di gravità ${severity}`,
            data: {
                bodyPart,
                severity,
                recoveryStatus: 'recovering',
                notes,
            },
            date: new Date().toISOString().split('T')[0],
        });
    }
    /**
     * Track goal status from OneAgenda
     */
    async trackGoal(userId, goalId, goalType, status, targetDate, progress) {
        const title = status === 'completed'
            ? `Obiettivo completato: ${goalType}`
            : status === 'failed'
                ? `Obiettivo non raggiunto: ${goalType}`
                : status === 'behind_schedule'
                    ? `Obiettivo in ritardo: ${goalType}`
                    : `Obiettivo in corso: ${goalType}`;
        await this.createEvent(userId, {
            eventType: 'goal',
            domain: 'oneagenda',
            title,
            description: status === 'behind_schedule'
                ? 'Obiettivo in ritardo rispetto alla scadenza prevista'
                : undefined,
            data: {
                goalId,
                goalType,
                status,
                targetDate: targetDate?.toISOString().split('T')[0],
                progress,
            },
            date: new Date().toISOString().split('T')[0],
        });
    }
    /**
     * Get timeline events for user
     */
    async getTimeline(userId, options = {}) {
        const where = {
            userId,
        };
        if (options.eventType) {
            where.eventType = options.eventType;
        }
        if (options.domain) {
            where.domain = options.domain;
        }
        if (options.startDate || options.endDate) {
            where.date = {};
            if (options.startDate) {
                where.date.gte = new Date(options.startDate);
            }
            if (options.endDate) {
                where.date.lte = new Date(options.endDate);
            }
        }
        const events = await prisma.user_memory_timeline.findMany({
            where,
            orderBy: { date: 'desc' },
            take: options.limit || 50,
        });
        return events.map((e) => ({
            id: e.id,
            userId: e.userId,
            eventType: e.eventType,
            domain: e.domain,
            title: e.title,
            description: e.description || undefined,
            data: e.data,
            date: e.date.toISOString().split('T')[0],
            createdAt: e.createdAt.toISOString(),
        }));
    }
    /**
     * Periodic check for auto-tracking (called by background job)
     */
    async performAutoTracking(userId) {
        // Detect weight progress
        await this.detectWeightProgress(userId);
        // Check OneAgenda goals (behind schedule, failed, completed)
        const goals = await prisma.user_goals.findMany({
            where: {
                userId,
                status: { in: ['ACTIVE', 'COMPLETED'] },
            },
        });
        if (goals.length === 0)
            return;
        // Batch fetch existing timeline events for all goals (avoid N+1)
        const existingEvents = await prisma.user_memory_timeline.findMany({
            where: {
                userId,
                eventType: 'goal',
                domain: 'oneagenda',
            },
            select: {
                data: true,
            },
        });
        // Build a Set of goalIds that already have timeline events
        const trackedGoalIds = new Set();
        for (const event of existingEvents) {
            const data = event.data;
            if (data?.goalId && typeof data.goalId === 'string') {
                trackedGoalIds.add(data.goalId);
            }
        }
        const now = new Date();
        for (const goal of goals) {
            const deadline = goal.deadline ? new Date(goal.deadline) : null;
            const completedDate = goal.completedDate ? new Date(goal.completedDate) : null;
            if (goal.status === 'COMPLETED' && completedDate) {
                // Check if we already tracked this completion (using pre-fetched data)
                if (!trackedGoalIds.has(goal.id)) {
                    await this.trackGoal(userId, goal.id, goal.type, 'completed', deadline || undefined);
                }
            }
            else if (deadline && now > deadline && goal.status === 'ACTIVE') {
                // Goal is behind schedule
                await this.trackGoal(userId, goal.id, goal.type, 'behind_schedule', deadline);
            }
        }
    }
}
// Export singleton
export const timelineService = new TimelineService();
