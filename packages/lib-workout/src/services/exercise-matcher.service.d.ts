/**
 * Exercise Matcher Service
 *
 * Servizio SOTA per il matching intelligente tra nomi esercizi importati
 * e esercizi nel database. Features:
 *
 * - Algoritmo Levenshtein ottimizzato
 * - N-gram index per ricerche O(1)
 * - Multi-level cache (DB, matches, n-grams)
 * - Alias multilingua (IT/EN)
 * - Batch processing parallelo con concurrency limit
 * - Phonetic matching fallback (Soundex-like)
 *
 * @module lib-workout/services/exercise-matcher
 */
import type { ImportedExercise } from '../schemas/imported-workout.schema';
/**
 * Risultato del matching per un singolo esercizio
 */
export interface ExerciseMatchResult {
    /** Nome originale dall'import */
    originalName: string;
    /** ID esercizio matchato (null se non trovato) */
    matchedId: string | null;
    /** Nome esercizio matchato */
    matchedName: string | null;
    /** Slug esercizio matchato */
    matchedSlug: string | null;
    /** Confidence del match (0-1) */
    confidence: number;
    /** Flag se è stato trovato un match */
    found: boolean;
    /** Suggerimenti alternativi */
    suggestions: Array<{
        id: string;
        name: string;
        slug: string;
        confidence: number;
    }>;
    /** Metodo usato per il match */
    matchMethod?: 'exact' | 'alias' | 'ngram' | 'fuzzy' | 'phonetic';
}
/**
 * Esercizio dal database per il matching
 */
interface DbExercise {
    id: string;
    slug: string;
    translations: Array<{
        locale: string;
        name: string;
        searchTerms: string[];
    }>;
}
/**
 * Exercise Matcher Service
 *
 * SOTA matching engine con multi-level pipeline:
 * 1. Cache hit check
 * 2. Exact match
 * 3. Alias match
 * 4. N-gram index search
 * 5. Fuzzy Levenshtein
 * 6. Phonetic fallback
 */
export declare class ExerciseMatcherService {
    /** Concurrency limit per batch processing */
    private static readonly BATCH_CONCURRENCY;
    /**
     * Carica tutti gli esercizi dal database per il matching
     */
    static loadExercises(locale?: string): Promise<DbExercise[]>;
    /**
     * Carica o costruisce l'indice N-gram
     */
    private static getNgramIndex;
    /**
     * Trova candidati usando l'indice N-gram
     * Riduce drasticamente lo spazio di ricerca
     */
    private static findCandidatesWithNgram;
    /**
     * Matcha un singolo nome esercizio con il database
     * Pipeline SOTA: cache -> exact -> alias -> ngram -> fuzzy -> phonetic
     */
    static matchExercise(name: string, locale?: string, threshold?: number): Promise<ExerciseMatchResult>;
    /**
     * Matcha un batch di esercizi importati
     * Ottimizzato con concurrency limit e deduplicazione
     */
    static matchExercises(exercises: ImportedExercise[], locale?: string, threshold?: number): Promise<Map<string, ExerciseMatchResult>>;
    /**
     * Applica i risultati del matching agli esercizi importati
     */
    static applyMatches(exercises: ImportedExercise[], matches: Map<string, ExerciseMatchResult>): ImportedExercise[];
    /**
     * Crea un esercizio non trovato nel database
     * Usato in modalità auto quando createMissingExercises è true
     */
    static createMissingExercise(name: string, _sourceFile: string, userId: string, locale?: string): Promise<string>;
    /**
     * Invalida tutte le cache del matcher
     */
    static invalidateCache(): void;
}
export {};
//# sourceMappingURL=exercise-matcher.service.d.ts.map