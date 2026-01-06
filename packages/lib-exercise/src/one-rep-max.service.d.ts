/**
 * One Rep Max Service
 *
 * CRUD operations per massimali 1RM degli utenti
 * Implementa SRP e segue pattern consistente con altri services
 *
 * NOMENCLATURA:
 * - catalogExerciseId: ID dell'esercizio nel catalogo (exercises.id)
 *
 * La validazione usa lo schema Zod centralizzato da @onecoach/schemas
 */
import type { UserOneRepMax, UserOneRepMaxWithExercise, UserOneRepMaxVersion } from '@onecoach/types';
/**
 * Input per creare/aggiornare un massimale
 */
export interface UpsertOneRepMaxInput {
    /** ID dell'esercizio nel catalogo database */
    catalogExerciseId: string;
    oneRepMax: number;
    notes?: string | null;
}
/**
 * Result type per operazioni service
 */
export interface ServiceResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}
export declare class OneRepMaxService {
    /**
     * Valida l'input usando lo schema Zod centralizzato.
     *
     * @returns OneRepMaxInput validato o null con errore
     */
    private static validateInput;
    /**
     * Ottiene tutti i massimali di un utente
     */
    static getByUserId(userId: string): Promise<ServiceResult<UserOneRepMaxWithExercise[]>>;
    /**
     * Ottiene il massimale per un esercizio specifico
     *
     * @param catalogExerciseId - ID dell'esercizio nel catalogo (alias: exerciseId per retrocompatibilità)
     */
    static getByExercise(userId: string, catalogExerciseId: string): Promise<ServiceResult<UserOneRepMaxWithExercise | null>>;
    /**
     * Crea o aggiorna un massimale (upsert)
     *
     * La validazione è centralizzata nello schema Zod.
     */
    static upsert(userId: string, input: UpsertOneRepMaxInput): Promise<ServiceResult<UserOneRepMaxWithExercise>>;
    /**
     * Ottiene la cronologia delle versioni di un massimale
     *
     * @param catalogExerciseId - ID dell'esercizio nel catalogo
     */
    static getVersions(userId: string, catalogExerciseId: string): Promise<ServiceResult<UserOneRepMaxVersion[]>>;
    /**
     * Elimina un massimale
     *
     * @param catalogExerciseId - ID dell'esercizio nel catalogo
     */
    static delete(userId: string, catalogExerciseId: string): Promise<ServiceResult<void>>;
    /**
     * Ottiene i massimali per più esercizi contemporaneamente (batch lookup)
     *
     * @param catalogExerciseIds - Array di ID esercizi dal catalogo
     */
    static getBatchByExercises(userId: string, catalogExerciseIds: string[]): Promise<ServiceResult<Map<string, UserOneRepMax>>>;
}
//# sourceMappingURL=one-rep-max.service.d.ts.map