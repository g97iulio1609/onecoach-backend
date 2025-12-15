/**
 * Nutrition Query Keys and Functions
 *
 * Standardized query keys and query functions for nutrition-related queries
 */
import { nutritionApi } from '../nutrition';
/**
 * Query keys for nutrition queries
 */
export const nutritionKeys = {
    all: ['nutrition'],
    lists: () => [...nutritionKeys.all, 'list'],
    list: (filters) => [...nutritionKeys.lists(), filters],
    details: () => [...nutritionKeys.all, 'detail'],
    detail: (id) => [...nutritionKeys.details(), id],
    versions: (id) => [...nutritionKeys.detail(id), 'versions'],
    logs: () => [...nutritionKeys.all, 'logs'],
    log: (logId) => [...nutritionKeys.logs(), logId],
};
/**
 * Query functions for nutrition
 */
export const nutritionQueries = {
    /**
     * Get all nutrition plans
     */
    getAll: () => {
        return nutritionApi.getAll();
    },
    /**
     * Get nutrition plan by ID
     */
    getById: (id) => {
        return nutritionApi.getById(id);
    },
    /**
     * Get nutrition plan versions
     */
    getVersions: (id) => {
        return nutritionApi.getVersions(id);
    },
    /**
     * Get nutrition day log by ID
     */
    getDayLog: (logId) => {
        return nutritionApi.getDayLog(logId);
    },
};
