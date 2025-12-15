/**
 * OneAgenda Query Keys and Functions
 *
 * Standardized query keys and query functions for tasks and goals queries
 */
/**
 * Base query key for oneagenda
 */
const oneagendaBaseKey = ['oneagenda'];
/**
 * Query keys for oneagenda queries
 */
export const oneagendaKeys = {
    all: oneagendaBaseKey,
    tasks: {
        all: [...oneagendaBaseKey, 'tasks'],
        lists: () => [...oneagendaBaseKey, 'tasks', 'list'],
        list: (filters) => [...oneagendaBaseKey, 'tasks', 'list', filters],
        details: () => [...oneagendaBaseKey, 'tasks', 'detail'],
        detail: (id) => [...oneagendaBaseKey, 'tasks', 'detail', id],
    },
    goals: {
        all: [...oneagendaBaseKey, 'goals'],
        lists: () => [...oneagendaBaseKey, 'goals', 'list'],
        list: (filters) => [...oneagendaBaseKey, 'goals', 'list', filters],
        details: () => [...oneagendaBaseKey, 'goals', 'detail'],
        detail: (id) => [...oneagendaBaseKey, 'goals', 'detail', id],
    },
    habits: {
        all: [...oneagendaBaseKey, 'habits'],
        lists: () => [...oneagendaBaseKey, 'habits', 'list'],
        list: () => [...oneagendaBaseKey, 'habits', 'list'],
        details: () => [...oneagendaBaseKey, 'habits', 'detail'],
        detail: (id) => [...oneagendaBaseKey, 'habits', 'detail', id],
    },
};
/**
 * Query functions for tasks
 */
export const tasksQueries = {
    /**
     * Get tasks list
     */
    list: async (filters) => {
        const params = new URLSearchParams();
        if (filters?.status)
            params.append('status', filters.status);
        if (filters?.priority)
            params.append('priority', filters.priority);
        if (filters?.tags && filters.tags.length > 0) {
            params.append('tags', filters.tags.join(','));
        }
        if (filters?.goalId)
            params.append('goalId', filters.goalId);
        const url = `/api/oneagenda/tasks${params.toString() ? `?${params.toString()}` : ''}`;
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
                : null) || 'Failed to fetch tasks';
            throw new Error(message);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    },
    /**
     * Create task
     */
    create: async (input) => {
        const response = await fetch('/api/oneagenda/tasks', {
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
                : null) || 'Failed to create task';
            throw new Error(message);
        }
        return await response.json();
    },
    /**
     * Update task status
     */
    updateStatus: async (id, status) => {
        const response = await fetch(`/api/oneagenda/tasks/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
            credentials: 'include',
        });
        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            const message = (payload && typeof payload === 'object' && 'error' in payload
                ? payload.error
                : null) || 'Failed to update task';
            throw new Error(message);
        }
        return await response.json();
    },
    /**
     * Delete task
     */
    delete: async (id) => {
        const response = await fetch(`/api/oneagenda/tasks/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            const message = (payload && typeof payload === 'object' && 'error' in payload
                ? payload.error
                : null) || 'Failed to delete task';
            throw new Error(message);
        }
    },
};
/**
 * Query functions for goals
 */
export const goalsQueries = {
    /**
     * Get goals list
     */
    list: async (filters) => {
        const params = new URLSearchParams();
        if (filters?.status)
            params.append('status', filters.status);
        const url = `/api/oneagenda/goals${params.toString() ? `?${params.toString()}` : ''}`;
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
                : null) || 'Failed to fetch goals';
            throw new Error(message);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    },
    /**
     * Create goal
     */
    create: async (input) => {
        const response = await fetch('/api/oneagenda/goals', {
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
                : null) || 'Failed to create goal';
            throw new Error(message);
        }
        return await response.json();
    },
    /**
     * Delete goal
     */
    delete: async (id) => {
        const response = await fetch(`/api/oneagenda/goals/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            const message = (payload && typeof payload === 'object' && 'error' in payload
                ? payload.error
                : null) || 'Failed to delete goal';
            throw new Error(message);
        }
    },
};
/**
 * Query functions for habits
 */
export const habitsQueries = {
    /**
     * Get habits list
     */
    list: async () => {
        const response = await fetch('/api/habits', {
            credentials: 'include',
        });
        if (response.status === 401 || response.status === 403) {
            throw new Error('UNAUTHENTICATED');
        }
        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            const message = (payload && typeof payload === 'object' && 'error' in payload
                ? payload.error
                : null) || 'Failed to fetch habits';
            throw new Error(message);
        }
        const data = await response.json();
        return data.habits || [];
    },
    /**
     * Toggle habit completion
     */
    toggle: async (id) => {
        const response = await fetch(`/api/habits/${id}/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
            credentials: 'include',
        });
        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            const message = (payload && typeof payload === 'object' && 'error' in payload
                ? payload.error
                : null) || 'Failed to toggle habit';
            throw new Error(message);
        }
        return await response.json();
    },
};
