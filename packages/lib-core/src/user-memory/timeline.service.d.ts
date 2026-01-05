/**
 * Timeline Service
 *
 * Auto-tracking service for significant user events.
 * KISS: Simple event detection and creation
 * SOLID: Single responsibility - only timeline management
 */
import type { TimelineEvent, TimelineEventType, MemoryDomain } from './types';
/**
 * Timeline Service
 */
export declare class TimelineService {
    /**
     * Create timeline event
     */
    createEvent(userId: string, event: Omit<TimelineEvent, 'id' | 'userId' | 'createdAt'>): Promise<TimelineEvent>;
    /**
     * Auto-detect weight progress (significant changes)
     */
    detectWeightProgress(userId: string): Promise<void>;
    /**
     * Track injury from health notes or user input
     */
    trackInjury(userId: string, bodyPart: string, severity: 'mild' | 'moderate' | 'severe', notes?: string): Promise<void>;
    /**
     * Track goal status from OneAgenda
     */
    trackGoal(userId: string, goalId: string, goalType: string, status: 'completed' | 'failed' | 'in_progress' | 'behind_schedule', targetDate?: Date, progress?: number): Promise<void>;
    /**
     * Get timeline events for user
     */
    getTimeline(userId: string, options?: {
        eventType?: TimelineEventType;
        domain?: MemoryDomain;
        startDate?: string;
        endDate?: string;
        limit?: number;
    }): Promise<TimelineEvent[]>;
    /**
     * Periodic check for auto-tracking (called by background job)
     */
    performAutoTracking(userId: string): Promise<void>;
}
export declare const timelineService: TimelineService;
