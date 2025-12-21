/**
 * Deep Clone Utility
 *
 * Centralized deep cloning utility to ensure DRY principle.
 * Provides both generic and type-safe deep clone functions.
 *
 * @module lib-workout/helpers/utils/deep-clone
 */
/**
 * Creates a deep clone of an object using JSON serialization.
 * Fast and simple for plain objects without circular references.
 *
 * @param obj - The object to clone
 * @returns A deep clone of the object
 *
 * @example
 * const program = { weeks: [...] };
 * const clone = deepClone(program);
 * // clone is completely independent from program
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Creates a shallow clone with specific nested paths deep cloned.
 * More efficient when only certain paths need deep cloning.
 *
 * @param obj - The object to clone
 * @param deepPaths - Array of paths to deep clone (dot notation)
 * @returns A mixed shallow/deep clone
 *
 * @example
 * const clone = selectiveDeepClone(program, ['weeks', 'metadata']);
 */
export declare function selectiveDeepClone<T extends Record<string, unknown>>(obj: T, deepPaths: string[]): T;
/**
 * Checks if an object has any circular references.
 * Useful for debugging when JSON.stringify fails.
 *
 * @param obj - The object to check
 * @returns true if circular references exist
 */
export declare function hasCircularReference(obj: unknown): boolean;
export default deepClone;
