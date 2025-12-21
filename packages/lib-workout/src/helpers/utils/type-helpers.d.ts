/**
 * Type Helpers
 *
 * Utility functions per type conversion e validation
 */
/**
 * Converte un valore sconosciuto in numero, con fallback
 */
export declare function ensureNumber(value: unknown, fallback?: number): number;
/**
 * Converte un valore sconosciuto in stringa, con fallback
 */
export declare function ensureString(value: unknown, fallback?: string): string;
/**
 * Converte un valore sconosciuto in array, con fallback ad array vuoto
 */
export declare function ensureArray<T>(value: unknown): T[];
/**
 * Converte un valore sconosciuto in array di stringhe
 */
export declare function ensureArrayOfStrings(value: unknown): string[];
/**
 * Parse JSON se il valore è una stringa, altrimenti ritorna il valore stesso
 */
export declare function parseJsonIfString<T>(value: unknown): T | null;
/**
 * Estrae il primo numero da una stringa o valore
 */
export declare function parseFirstNumber(value: unknown): number | undefined;
