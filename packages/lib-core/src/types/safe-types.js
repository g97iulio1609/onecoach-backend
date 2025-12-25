/**
 * Safe Type Utilities
 *
 * SSOT for type-safe alternatives to `any` across the codebase.
 * Following SOLID principles: Single Responsibility for type safety.
 */import { logger } from '@onecoach/lib-core';

/**
 * Type guard for object with specific property.
 *
 * @example
 * if (hasProperty(obj, 'id')) {
 *   logger.warn(obj.id); // Type-safe access
 * }
 */
export function hasProperty(obj, key) {
    return typeof obj === 'object' && obj !== null && key in obj;
}
/**
 * Type guard for objects (non-null, non-array).
 */
export function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/**
 * Type guard for Error objects.
 */
export function isError(value) {
    return value instanceof Error;
}
/**
 * Safe cast with runtime validation.
 * Returns undefined if validation fails.
 *
 * @example
 * const user = safeCast(data, isUser);
 * if (user) { // Type is User
 *   logger.warn(user.name);
 * }
 */
export function safeCast(value, validator) {
    return validator(value) ? value : undefined;
}
/**
 * Extract error message safely from unknown error.
 * Use in catch blocks instead of `(error: any)`.
 *
 * @example
 * try {
 *   // ...
 * } catch (error) {
 *   logger.error(getErrorMessage(error));
 * }
 */
export function getErrorMessage(error) {
    if (isError(error)) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (isObject(error) && typeof error.message === 'string') {
        return error.message;
    }
    return String(error);
}
/**
 * Extract error stack safely from unknown error.
 */
export function getErrorStack(error) {
    if (isError(error)) {
        return error.stack;
    }
    if (isObject(error) && typeof error.stack === 'string') {
        return error.stack;
    }
    return undefined;
}
