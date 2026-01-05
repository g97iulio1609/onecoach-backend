/**
 * Memory API Client
 *
 * Client functions for memory CRUD operations.
 * KISS: Simple fetch wrappers
 * DRY: Reusable error handling
 */
import type { UserMemory, MemoryDomain, MemoryUpdate, TimelineEvent, TimelineEventType, MemoryVersion } from '@onecoach/lib-core/user-memory/types';
/**
 * Get user memory
 */
export declare function getMemory(options?: {
    domain?: MemoryDomain;
    includeHistory?: boolean;
    includePatterns?: boolean;
    includeInsights?: boolean;
    historyLimit?: number;
}): Promise<UserMemory>;
/**
 * Update memory preferences
 */
export declare function updateMemoryPreferences(domain: MemoryDomain, preferences: Record<string, unknown>): Promise<UserMemory>;
/**
 * Update memory (full update)
 */
export declare function updateMemory(update: MemoryUpdate): Promise<UserMemory>;
/**
 * Enhance text using AI
 */
export declare function enhanceText(text: string, options?: {
    context?: string;
    domain?: MemoryDomain;
    style?: 'professional' | 'casual' | 'detailed' | 'concise';
}): Promise<string>;
/**
 * Get version history
 */
export declare function getVersionHistory(limit?: number): Promise<MemoryVersion[]>;
/**
 * Save version snapshot
 */
export declare function saveVersion(changeNote?: string): Promise<MemoryVersion>;
/**
 * Get timeline events
 */
export declare function getTimeline(options?: {
    eventType?: TimelineEventType;
    domain?: MemoryDomain;
    startDate?: string;
    endDate?: string;
    limit?: number;
}): Promise<TimelineEvent[]>;
/**
 * Create timeline event
 */
export declare function createTimelineEvent(event: {
    eventType: TimelineEventType;
    domain?: MemoryDomain;
    title: string;
    description?: string;
    data?: Record<string, unknown>;
    date: string;
}): Promise<TimelineEvent>;
//# sourceMappingURL=memory.d.ts.map