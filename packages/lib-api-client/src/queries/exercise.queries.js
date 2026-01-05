/**
 * Exercise Query Keys and Functions
 *
 * Standardized query keys and query functions for exercise-related queries
 */
import { exerciseApi } from '../exercise';
/**
 * Query keys for exercise queries
 */
export const exerciseKeys = {
    all: ['exercises'],
    lists: () => [...exerciseKeys.all, 'list'],
    list: (params) => [...exerciseKeys.lists(), params],
    details: () => [...exerciseKeys.all, 'detail'],
    detail: (id) => [...exerciseKeys.details(), id],
};
/**
 * Query functions for exercises
 */
export const exerciseQueries = {
    /**
     * Get all exercises with optional filters
     */
    list: (params) => {
        return exerciseApi.list(params);
    },
    /**
     * Get exercise by ID
     */
    getById: (id) => {
        return exerciseApi.getById(id);
    },
};
