/**
 * Body Measurements Query Keys and Functions
 *
 * Standardized query keys and query functions for body measurements queries
 */
/**
 * Query keys for body measurements queries
 */
export const bodyMeasurementsKeys = {
    all: ['body-measurements'],
    lists: () => [...bodyMeasurementsKeys.all, 'list'],
    list: (filters) => [...bodyMeasurementsKeys.lists(), filters],
    details: () => [...bodyMeasurementsKeys.all, 'detail'],
    detail: (id) => [...bodyMeasurementsKeys.details(), id],
};
/**
 * Query functions for body measurements
 */
export const bodyMeasurementsQueries = {
    /**
     * Get body measurements list
     */
    list: async (filters) => {
        const params = new URLSearchParams();
        if (filters?.startDate)
            params.append('startDate', filters.startDate);
        if (filters?.endDate)
            params.append('endDate', filters.endDate);
        if (filters?.limit)
            params.append('limit', filters.limit.toString());
        if (filters?.latest)
            params.append('latest', 'true');
        const url = `/api/analytics/body-measurements${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url, {
            credentials: 'include',
        });
        if (response.status === 401 || response.status === 403) {
            throw new Error('UNAUTHENTICATED');
        }
        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            const message = (payload && typeof payload === 'object' && 'error' in payload
                ? payload.error
                : null) || 'Failed to fetch body measurements';
            throw new Error(message);
        }
        const payload = await response.json();
        const data = payload;
        return data.measurements || [];
    },
    /**
     * Get single body measurement by ID
     */
    detail: async (id) => {
        const response = await fetch(`/api/analytics/body-measurements/${id}`, {
            credentials: 'include',
        });
        if (response.status === 401 || response.status === 403) {
            throw new Error('UNAUTHENTICATED');
        }
        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            const message = (payload && typeof payload === 'object' && 'error' in payload
                ? payload.error
                : null) || 'Failed to fetch body measurement';
            throw new Error(message);
        }
        const payload = await response.json();
        const data = payload;
        return data.measurement;
    },
    /**
     * Create body measurement
     */
    create: async (input) => {
        const response = await fetch('/api/analytics/body-measurements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
            credentials: 'include',
        });
        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            const message = (payload && typeof payload === 'object' && 'error' in payload
                ? payload.error
                : null) || 'Failed to create body measurement';
            throw new Error(message);
        }
        const payload = await response.json();
        const data = payload;
        return data.measurement;
    },
    /**
     * Update body measurement
     */
    update: async (id, input) => {
        const response = await fetch(`/api/analytics/body-measurements/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
            credentials: 'include',
        });
        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            const message = (payload && typeof payload === 'object' && 'error' in payload
                ? payload.error
                : null) || 'Failed to update body measurement';
            throw new Error(message);
        }
        const payload = await response.json();
        const data = payload;
        return data.measurement;
    },
    /**
     * Delete body measurement
     */
    delete: async (id) => {
        const response = await fetch(`/api/analytics/body-measurements/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            const message = (payload && typeof payload === 'object' && 'error' in payload
                ? payload.error
                : null) || 'Failed to delete body measurement';
            throw new Error(message);
        }
    },
};
