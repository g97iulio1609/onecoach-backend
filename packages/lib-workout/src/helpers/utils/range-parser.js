/**
 * Range Parser
 *
 * Utility per parsing e formatting di input range come "8-10"
 * Gestisce edge cases: valori singoli, trattini invalidi, numeri decimali
 *
 * KISS: Funzioni pure, nessun side effect
 * DRY: Logica centralizzata per tutti i campi range
 *
 * @module lib-workout/helpers/utils/range-parser
 */
// =====================================================
// Constants
// =====================================================
const DEFAULT_OPTIONS = {
    minValue: 0,
    maxValue: Infinity,
    allowDecimals: true,
    decimalPlaces: 1,
};
// =====================================================
// Core Functions
// =====================================================
/**
 * Parsifica un input range nel formato "min-max" o "valore"
 *
 * Gestione sicura del trattino:
 * - "8-10" → { min: 8, max: 10 }
 * - "8" → { min: 8 }
 * - "-10" → { min: 10 } (trattino iniziale ignorato)
 * - "8-" → { min: 8 }
 * - "" → null
 *
 * @param input - Stringa input (es. "8-10", "80", "6.5-8")
 * @param options - Opzioni di parsing
 * @returns ParsedRange o null se input invalido
 *
 * @example
 * parseRange("8-10") // { min: 8, max: 10 }
 * parseRange("80") // { min: 80 }
 * parseRange("6.5-8.5", { decimalPlaces: 1 }) // { min: 6.5, max: 8.5 }
 */
export function parseRange(input, options = {}) {
    // Gestione input non-stringa
    if (input === null || input === undefined)
        return null;
    const opts = { ...DEFAULT_OPTIONS, ...options };
    if (typeof input === 'number') {
        return validateAndClamp(input, undefined, opts);
    }
    const trimmed = input.trim();
    if (!trimmed)
        return null;
    // Rimuovi trattini iniziali (valori negativi non hanno senso per fitness)
    const sanitized = trimmed.replace(/^-+/, '');
    if (!sanitized)
        return null;
    // Cerca il separatore "-" ma non all'inizio
    // Pattern: numero opzionalmente seguito da "-numero"
    const match = sanitized.match(/^(\d+(?:\.\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?))?$/);
    if (!match) {
        // Fallback: prova a estrarre solo numeri
        const numbers = sanitized.match(/\d+(?:\.\d+)?/g);
        if (!numbers || numbers.length === 0)
            return null;
        const min = parseFloat(numbers[0]);
        const max = numbers[1] ? parseFloat(numbers[1]) : undefined;
        return validateAndClamp(min, max, opts);
    }
    const min = parseFloat(match[1]);
    const max = match[2] ? parseFloat(match[2]) : undefined;
    return validateAndClamp(min, max, opts);
}
/**
 * Formatta un range in stringa "min-max" o "min"
 *
 * @param min - Valore minimo
 * @param max - Valore massimo (opzionale)
 * @param decimalPlaces - Decimali da mostrare (default: auto)
 * @returns Stringa formattata
 *
 * @example
 * formatRange(8, 10) // "8-10"
 * formatRange(80) // "80"
 * formatRange(6.5, 8.5) // "6.5-8.5"
 */
export function formatRange(min, max, decimalPlaces) {
    if (min === null || min === undefined)
        return '';
    const formatNumber = (n) => {
        if (decimalPlaces !== undefined) {
            return n.toFixed(decimalPlaces).replace(/\.?0+$/, '');
        }
        // Auto: rimuovi decimali se sono .0
        return Number.isInteger(n) ? n.toString() : n.toFixed(1).replace(/\.?0+$/, '');
    };
    const minStr = formatNumber(min);
    if (max !== null && max !== undefined && max !== min) {
        return `${minStr}-${formatNumber(max)}`;
    }
    return minStr;
}
/**
 * Parsifica e ritorna i valori separati per min e max
 * Utile per aggiornare campi del database
 *
 * @param input - Input range
 * @param fieldName - Nome campo base (es. "reps", "weight")
 * @returns Oggetto con campi min e max nominati
 *
 * @example
 * parseRangeToFields("8-10", "reps")
 * // { reps: 8, repsMax: 10 }
 */
export function parseRangeToFields(input, fieldName, options = {}) {
    const parsed = parseRange(input, options);
    if (!parsed)
        return null;
    const result = {
        [fieldName]: parsed.min,
        [`${fieldName}Max`]: parsed.max,
    };
    return result;
}
/**
 * Verifica se un input rappresenta un range (min ≠ max)
 */
export function isRange(input) {
    const parsed = parseRange(input);
    return parsed !== null && parsed.max !== undefined && parsed.max !== parsed.min;
}
/**
 * Ottiene il valore medio di un range
 */
export function getRangeMidpoint(input) {
    const parsed = parseRange(input);
    if (!parsed)
        return null;
    if (parsed.max !== undefined) {
        return (parsed.min + parsed.max) / 2;
    }
    return parsed.min;
}
// =====================================================
// Preset Validators (DRY)
// =====================================================
/** Opzioni per parsing reps (intero, 1-100) */
export const REPS_OPTIONS = {
    minValue: 1,
    maxValue: 100,
    allowDecimals: false,
    decimalPlaces: 0,
};
/** Opzioni per parsing weight (decimale, 0-1000) */
export const WEIGHT_OPTIONS = {
    minValue: 0,
    maxValue: 1000,
    allowDecimals: true,
    decimalPlaces: 1,
};
/** Opzioni per parsing intensity % (decimale, 0-100) */
export const INTENSITY_OPTIONS = {
    minValue: 0,
    maxValue: 100,
    allowDecimals: true,
    decimalPlaces: 1,
};
/** Opzioni per parsing RPE (decimale, 1-10) */
export const RPE_OPTIONS = {
    minValue: 1,
    maxValue: 10,
    allowDecimals: true,
    decimalPlaces: 1,
};
/** Opzioni per parsing rest in secondi */
export const REST_OPTIONS = {
    minValue: 0,
    maxValue: 600,
    allowDecimals: false,
    decimalPlaces: 0,
};
// =====================================================
// Helper Shortcut Functions
// =====================================================
export const parseReps = (input) => parseRange(input, REPS_OPTIONS);
export const parseWeight = (input) => parseRange(input, WEIGHT_OPTIONS);
export const parseIntensity = (input) => parseRange(input, INTENSITY_OPTIONS);
export const parseRPE = (input) => parseRange(input, RPE_OPTIONS);
export const parseRest = (input) => parseRange(input, REST_OPTIONS);
// =====================================================
// Private Helpers
// =====================================================
function validateAndClamp(min, max, options) {
    if (isNaN(min))
        return null;
    // Clamp min
    let clampedMin = Math.max(options.minValue, Math.min(options.maxValue, min));
    // Round if needed
    if (!options.allowDecimals) {
        clampedMin = Math.round(clampedMin);
    }
    else {
        clampedMin = roundTo(clampedMin, options.decimalPlaces);
    }
    // Process max
    let clampedMax;
    if (max !== undefined && !isNaN(max)) {
        clampedMax = Math.max(options.minValue, Math.min(options.maxValue, max));
        if (!options.allowDecimals) {
            clampedMax = Math.round(clampedMax);
        }
        else {
            clampedMax = roundTo(clampedMax, options.decimalPlaces);
        }
        // Ensure max >= min
        if (clampedMax < clampedMin) {
            // Swap values
            [clampedMin, clampedMax] = [clampedMax, clampedMin];
        }
        // If equal, treat as single value
        if (clampedMax === clampedMin) {
            clampedMax = undefined;
        }
    }
    return { min: clampedMin, max: clampedMax };
}
function roundTo(value, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}
export default parseRange;
