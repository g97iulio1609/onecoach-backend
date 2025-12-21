/**
 * File Validator Service
 *
 * Validazione MINIMA e sanitizzazione file per l'import workout.
 * FILOSOFIA: L'AI deve poter interpretare qualsiasi file - validazione solo per sicurezza.
 *
 * @module lib-workout/services/file-validator
 */
import type { ImportFile } from '../schemas/imported-workout.schema';
/**
 * Risultato della validazione
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    sanitizedFile?: ImportFile;
}
/**
 * File Validator Service
 *
 * NOTA: Validazione MINIMA per massima flessibilità.
 * L'AI interpreterà qualsiasi formato di file.
 */
export declare class FileValidatorService {
    /**
     * Valida un singolo file - VALIDAZIONE MINIMA
     * Solo controlli essenziali per sicurezza
     */
    static validateFile(file: ImportFile): ValidationResult;
    /**
     * Valida un array di file
     */
    static validateFiles(files: ImportFile[]): {
        valid: boolean;
        results: Array<{
            file: ImportFile;
            result: ValidationResult;
        }>;
        totalErrors: string[];
    };
    /**
     * Verifica rate limiting per un utente
     */
    static checkRateLimit(userId: string): {
        allowed: boolean;
        remaining: number;
        resetIn: number;
    };
    /**
     * Incrementa il contatore rate limit
     */
    static incrementRateLimit(userId: string): void;
    /**
     * Verifica se una stringa è un base64 valido
     */
    private static isValidBase64;
    /**
     * Sanitizza il contenuto del file
     */
    private static sanitizeFile;
    /**
     * Verifica se il contenuto contiene script o macro potenzialmente pericolosi
     * (per file Office)
     */
    static checkForMaliciousContent(base64Content: string): {
        safe: boolean;
        warnings: string[];
    };
    /**
     * Pulisce la cache del rate limiter (per test o manutenzione)
     */
    static clearRateLimitCache(): void;
}
