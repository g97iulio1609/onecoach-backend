/**
 * Food Matching Service
 *
 * Sistema di deduplicazione alimenti con 3 livelli:
 * 1. Match esatto (nome normalizzato, barcode)
 * 2. BM25 search (relevance-based)
 * 3. Fuzzy match (Levenshtein distance)
 */
import type { FoodItem, LabelExtractionResult } from '@onecoach/types';
export declare class FoodMatchingService {
    /**
     * Trova o crea alimento usando sistema a 3 livelli
     */
    static findOrCreateFood(extractedData: LabelExtractionResult): Promise<{
        foodItem: FoodItem;
        matchType: 'exact' | 'bm25' | 'fuzzy' | 'created';
    }>;
    /**
     * Match esatto: nome normalizzato o barcode
     */
    private static matchExact;
    /**
     * Match BM25: relevance-based search
     */
    private static matchBM25;
    /**
     * Match fuzzy: Levenshtein distance
     */
    private static matchFuzzy;
    /**
     * Match multipli alimenti (per segmentazione piatto)
     * Usa solo nome per matching, i macros verranno presi dal foodItem trovato
     */
    static findOrCreateMultipleFoods(extractedItems: Array<{
        name: string;
        quantity: number;
    }>): Promise<Array<{
        foodItem: FoodItem;
        matchType: 'exact' | 'bm25' | 'fuzzy' | 'created';
        quantity: number;
    }>>;
}
