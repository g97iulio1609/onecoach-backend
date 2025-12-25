/**
 * Type Helpers
 *
 * Utility functions per type conversion e validation
 */import { logger } from '@onecoach/lib-core';

/**
 * Converte un valore sconosciuto in numero, con fallback
 */
export function ensureNumber(value, fallback = 0) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'string') {
        const normalized = value.replace(',', '.');
        const parsed = Number.parseFloat(normalized);
        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }
    return fallback;
}
/**
 * Converte un valore sconosciuto in stringa, con fallback
 */
export function ensureString(value, fallback = '') {
    if (typeof value === 'string') {
        return value;
    }
    if (value === undefined || value === null) {
        return fallback;
    }
    return String(value);
}
/**
 * Converte un valore sconosciuto in array, con fallback ad array vuoto
 */
export function ensureArray(value) {
    return Array.isArray(value) ? value : [];
}
/**
 * Converte un valore sconosciuto in array di stringhe
 */
export function ensureArrayOfStrings(value) {
    if (Array.isArray(value)) {
        return value.map((entry) => String(entry)).filter(Boolean);
    }
    if (typeof value === 'string') {
        return value
            .split(',')
            .map((piece) => piece.trim())
            .filter(Boolean);
    }
    return [];
}
/**
 * Parse JSON se il valore è una stringa, altrimenti ritorna il valore stesso
 */
export function parseJsonIfString(value) {
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        }
        catch (_error) {
            logger.warn('Failed to parse JSON string value', _error);
            return null;
        }
    }
    if (value && typeof value === 'object') {
        return value;
    }
    return null;
}
/**
 * Estrae il primo numero da una stringa o valore
 */
export function parseFirstNumber(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'string') {
        const match = value.match(/-?\d+(?:\.\d+)?/);
        if (match) {
            const parsed = Number.parseFloat(match[0]);
            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
    }
    return undefined;
}
