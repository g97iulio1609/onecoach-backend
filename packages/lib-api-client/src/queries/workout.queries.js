/**
 * Workout Query Keys and Functions
 *
 * Standardized query keys and query functions for workout-related queries
 */
import { workoutApi } from '../workout';
/**
 * Query keys for workout queries
 */
export const workoutKeys = {
    all: ['workouts'],
    lists: () => [...workoutKeys.all, 'list'],
    list: (filters) => [...workoutKeys.lists(), filters],
    details: () => [...workoutKeys.all, 'detail'],
    detail: (id) => [...workoutKeys.details(), id],
    sessions: () => [...workoutKeys.all, 'sessions'],
    session: (sessionId) => [...workoutKeys.sessions(), sessionId],
};
/**
 * Query functions for workouts
 */
export const workoutQueries = {
    /**
     * Get all workout programs
     */
    getAll: () => {
        return workoutApi.getAll();
    },
    /**
     * Get workout program by ID
     */
    getById: (id) => {
        return workoutApi.getById(id);
    },
    /**
     * Get workout session by ID
     */
    getSession: (sessionId) => {
        return workoutApi.getSession(sessionId);
    },
};
