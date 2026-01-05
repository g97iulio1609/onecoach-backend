/**
 * Food Query Keys and Functions
 *
 * Standardized query keys and query functions for food-related queries
 */
import { foodApi } from '../food';
/**
 * Query keys for food queries
 */
export const foodKeys = {
    all: ['foods'],
    lists: () => [...foodKeys.all, 'list'],
    list: (params) => [...foodKeys.lists(), params],
    details: () => [...foodKeys.all, 'detail'],
    detail: (id) => [...foodKeys.details(), id],
};
/**
 * Query functions for foods
 */
export const foodQueries = {
    /**
     * Get all foods with optional filters
     */
    list: (params) => {
        return foodApi.list(params);
    },
    /**
     * Get food by ID
     */
    getById: (id) => {
        return foodApi.getById(id);
    },
};
