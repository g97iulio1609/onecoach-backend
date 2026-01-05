/**
 * Memory API Client
 *
 * Client functions for memory CRUD operations.
 * KISS: Simple fetch wrappers
 * DRY: Reusable error handling
 */
/**
 * Get user memory
 */
export async function getMemory(options = {}) {
    const params = new URLSearchParams();
    if (options.domain)
        params.set('domain', options.domain);
    if (options.includeHistory === false)
        params.set('includeHistory', 'false');
    if (options.includePatterns === false)
        params.set('includePatterns', 'false');
    if (options.includeInsights === false)
        params.set('includeInsights', 'false');
    if (options.historyLimit)
        params.set('historyLimit', options.historyLimit.toString());
    const response = await fetch(`/api/memory?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch memory');
    }
    const data = await response.json();
    return data.memory;
}
/**
 * Update memory preferences
 */
export async function updateMemoryPreferences(domain, preferences) {
    const response = await fetch('/api/memory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, preferences }),
    });
    if (!response.ok) {
        throw new Error('Failed to update memory');
    }
    const data = await response.json();
    return data.memory;
}
/**
 * Update memory (full update)
 */
export async function updateMemory(update) {
    const response = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
    });
    if (!response.ok) {
        throw new Error('Failed to update memory');
    }
    const data = await response.json();
    return data.memory;
}
/**
 * Enhance text using AI
 */
export async function enhanceText(text, options = {}) {
    const response = await fetch('/api/memory/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            text,
            ...options,
        }),
    });
    if (!response.ok) {
        throw new Error('Failed to enhance text');
    }
    const data = await response.json();
    return data.enhanced;
}
/**
 * Get version history
 */
export async function getVersionHistory(limit = 20) {
    const response = await fetch(`/api/memory/history?limit=${limit}`);
    if (!response.ok) {
        throw new Error('Failed to fetch version history');
    }
    const data = await response.json();
    return data.versions;
}
/**
 * Save version snapshot
 */
export async function saveVersion(changeNote) {
    const response = await fetch('/api/memory/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeNote }),
    });
    if (!response.ok) {
        throw new Error('Failed to save version');
    }
    const data = await response.json();
    return data.version;
}
/**
 * Get timeline events
 */
export async function getTimeline(options = {}) {
    const params = new URLSearchParams();
    if (options.eventType)
        params.set('eventType', options.eventType);
    if (options.domain)
        params.set('domain', options.domain);
    if (options.startDate)
        params.set('startDate', options.startDate);
    if (options.endDate)
        params.set('endDate', options.endDate);
    if (options.limit)
        params.set('limit', options.limit.toString());
    const response = await fetch(`/api/memory/timeline?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch timeline');
    }
    const data = await response.json();
    return data.events;
}
/**
 * Create timeline event
 */
export async function createTimelineEvent(event) {
    const response = await fetch('/api/memory/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
    });
    if (!response.ok) {
        throw new Error('Failed to create timeline event');
    }
    const data = await response.json();
    return data.event;
}
