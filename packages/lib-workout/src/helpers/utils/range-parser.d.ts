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
/**
 * Risultato del parsing di un range
 */
export interface ParsedRange {
    min: number;
    max?: number;
}
/**
 * Opzioni per il parsing
 */
export interface ParseRangeOptions {
    /** Valore minimo consentito (default: 0) */
    minValue?: number;
    /** Valore massimo consentito (default: Infinity) */
    maxValue?: number;
    /** Consenti decimali (default: true) */
    allowDecimals?: boolean;
    /** Arrotonda a N decimali (default: 1) */
    decimalPlaces?: number;
}
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
export declare function parseRange(input: string | number | null | undefined, options?: ParseRangeOptions): ParsedRange | null;
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
export declare function formatRange(min: number | null | undefined, max?: number | null, decimalPlaces?: number): string;
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
export declare function parseRangeToFields<T extends string>(input: string | number | null | undefined, fieldName: T, options?: ParseRangeOptions): Record<T | `${T}Max`, number | undefined> | null;
/**
 * Verifica se un input rappresenta un range (min ≠ max)
 */
export declare function isRange(input: string | number | null | undefined): boolean;
/**
 * Ottiene il valore medio di un range
 */
export declare function getRangeMidpoint(input: string | number | null | undefined): number | null;
/** Opzioni per parsing reps (intero, 1-100) */
export declare const REPS_OPTIONS: ParseRangeOptions;
/** Opzioni per parsing weight (decimale, 0-1000) */
export declare const WEIGHT_OPTIONS: ParseRangeOptions;
/** Opzioni per parsing intensity % (decimale, 0-100) */
export declare const INTENSITY_OPTIONS: ParseRangeOptions;
/** Opzioni per parsing RPE (decimale, 1-10) */
export declare const RPE_OPTIONS: ParseRangeOptions;
/** Opzioni per parsing rest in secondi */
export declare const REST_OPTIONS: ParseRangeOptions;
export declare const parseReps: (input: string | number | null | undefined) => ParsedRange | null;
export declare const parseWeight: (input: string | number | null | undefined) => ParsedRange | null;
export declare const parseIntensity: (input: string | number | null | undefined) => ParsedRange | null;
export declare const parseRPE: (input: string | number | null | undefined) => ParsedRange | null;
export declare const parseRest: (input: string | number | null | undefined) => ParsedRange | null;
export default parseRange;
//# sourceMappingURL=range-parser.d.ts.map