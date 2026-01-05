/**
 * Auth Query Keys and Functions
 *
 * Standardized query keys and query functions for authentication
 */
import { logger } from '@onecoach/lib-core';
/**
 * Query keys for auth queries
 */
export const authKeys = {
    all: ['auth'],
    me: () => [...authKeys.all, 'me'],
};
/**
 * Query functions for auth
 */
export const authQueries = {
    /**
     * Get current user
     */
    getMe: async () => {
        const response = await fetch('/api/auth/me', {
            credentials: 'include',
        });
        if (response.status === 401 || response.status === 403) {
            throw new Error('UNAUTHENTICATED');
        }
        if (!response.ok) {
            throw new Error('Failed to fetch user');
        }
        const data = await response.json();
        return data.user;
    },
    /**
     * Login
     */
    login: async (credentials) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Login failed');
        }
        const data = await response.json();
        if (!data.user || !data.accessToken) {
            throw new Error('Invalid response from server');
        }
        return data;
    },
    /**
     * Register
     */
    register: async (data) => {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Registration failed');
        }
        const result = await response.json();
        if (!result.user || !result.accessToken) {
            throw new Error('Invalid response from server');
        }
        return result;
    },
    /**
     * Logout
     */
    logout: async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        }
        catch (error) {
            // Ignore errors, we'll clear local session anyway
            logger.warn('Logout API call failed:', { error });
        }
    },
    /**
     * Refresh access token
     */
    refresh: async (request) => {
        const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }
        const data = await response.json();
        if (!data.accessToken) {
            throw new Error('Invalid refresh response');
        }
        return data;
    },
};
