/**
 * Food Service
 *
 * Servizio per gestione catalogo alimenti con search BM25
 * Segue pattern ExerciseService per consistenza
 *
 * NOTE: This file does not use 'server-only' because it's exported from lib-food
 * which is imported by one-agent package used in client components. The service
 * methods themselves are only executed server-side when called from API routes
 * or server components. Pure utility functions like normalizeFoodName can be
 * safely used in client components.
 */
import type { FoodItem } from '@onecoach/types';
import type { Macros } from '@onecoach/types';
import type { FoodsResponse } from '@onecoach/lib-api';
interface SearchFoodOptions {
    locale?: string;
    limit?: number;
    page?: number;
    pageSize?: number;
}
interface FoodListOptions {
    limit?: number;
    page?: number;
    pageSize?: number;
    locale?: string;
}
/**
 * Normalizza nome alimento per matching
 */
export declare function normalizeFoodName(name: string): string;
/**
 * Calcola macros per quantità data da macrosPer100g
 */
export declare function calculateMacrosFromQuantity(macrosPer100g: Macros, quantity: number, unit?: string): Macros;
export declare class FoodService {
    /**
     * Recupera alimento per ID
     */
    static getFoodById(id: string): Promise<FoodItem | null>;
    /**
     * Recupera multipli alimenti per IDs (batch lookup)
     */
    static getFoodsByIds(ids: string[]): Promise<FoodItem[]>;
    /**
     * Recupera alimenti comuni (es. per contesto AI)
     * Restituisce gli ultimi alimenti creati o aggiornati
     */
    static getCommonFoods(limit?: number): Promise<FoodItem[]>;
    /**
     * Lista alimenti con paginazione
     * SSOT: Restituisce direttamente FoodsResponse da lib-api (nessuna duplicazione)
     */
    static list(options?: FoodListOptions): Promise<FoodsResponse & {
        page: number;
        pageSize: number;
    }>;
    /**
     * Cerca alimenti con BM25 search
     */
    static searchFoods(query: string, options?: SearchFoodOptions): Promise<FoodItem[]>;
    /**
     * Crea nuovo alimento
     */
    static createFood(data: {
        name: string;
        description: string;
        macrosPer100g: Macros;
        servingSize: number;
        unit?: string;
        barcode?: string;
        metadata?: Record<string, unknown>;
        imageUrl?: string;
        locale?: string;
        brandId?: string;
        brandName?: string;
        categoryIds?: string[];
    }): Promise<FoodItem>;
    /**
     * Aggiorna alimento esistente
     */
    static updateFood(id: string, data: {
        name?: string;
        description: string;
        macrosPer100g?: Macros;
        servingSize?: number;
        unit?: string;
        barcode?: string;
        metadata?: Record<string, unknown>;
        imageUrl?: string;
        brandId?: string;
        brandName?: string;
        categoryIds?: string[];
    }): Promise<FoodItem>;
    /**
     * Calcola mainMacro dai macros
     */
    private static calculateMainMacro;
    /**
     * Cerca alimenti per nome normalizzato (batch lookup, usato in matching)
     */
    static getFoodsByNames(names: string[], locale?: string): Promise<Map<string, FoodItem>>;
    /**
     * Cerca alimento per nome normalizzato esatto (usato in matching esatto)
     */
    static getFoodByNameNormalized(normalizedName: string): Promise<FoodItem | null>;
    /**
     * Search full-text con BM25
     */
    private static searchFullText;
    /**
     * Mappa Prisma model a FoodItem type
     */
    private static mapToFoodItem;
}
export declare const foodService: typeof FoodService;
export {};
