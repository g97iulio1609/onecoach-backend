/**
 * Food Auto-Creation Service
 *
 * Servizio centralizzato per creare automaticamente alimenti non presenti nel database
 * durante la generazione di piani nutrizionali AI.
 *
 * ARCHITETTURA:
 * - SSOT: Usa schemi da @onecoach/schemas per validazione
 * - Matching: Fuzzy match + macro similarity
 * - Batch processing per efficienza
 * - Logging dettagliato per tracciabilità
 *
 * FLUSSO:
 * 1. AI genera alimenti con schema AIGeneratedFoodSchema
 * 2. FoodAutoCreationService processa tutti gli alimenti
 * 3. Per ogni alimento: match esistente o crea nuovo
 * 4. Restituisce mappa di foodItemId validi
 */
import type { Macros, NutritionPlan } from '@onecoach/types';
import { type AIGeneratedFood } from '@onecoach/schemas';
/**
 * Food da processare dall'output AI
 * Estende AIGeneratedFood con campi aggiuntivi per il processing
 */
export interface FoodToProcess {
    /** ID temporaneo del food nel piano (per mappatura) */
    id?: string;
    /** Nome alimento */
    name: string;
    /** Macros per 100g */
    macrosPer100g: Macros;
    /** Unità di misura */
    unit: string;
    /** Porzione standard */
    servingSize: number;
    /** Descrizione (OBBLIGATORIA) */
    description: string;
    /** Nome brand */
    brandName?: string;
    /** URL immagine */
    imageUrl?: string | null;
    /** Barcode */
    barcode?: string | null;
    /** Categoria */
    category?: string;
}
/**
 * Risultato del matching/creazione alimento
 */
export interface FoodCreationResult {
    id: string;
    name: string;
    existed: boolean;
    status: 'existing' | 'created' | 'matched' | 'error';
    matchType?: 'exact' | 'fuzzy' | 'created';
    confidence?: number;
}
/**
 * Risultato batch processing
 */
export interface BatchResolutionResult {
    resolved: Map<string, FoodCreationResult>;
    created: number;
    matched: number;
    existing: number;
    errors: Array<{
        name: string;
        error: string;
    }>;
}
/**
 * Servizio centralizzato per la creazione automatica di alimenti
 *
 * @example
 * ```typescript
 * // Processa alimenti da AI output
 * const result = await FoodAutoCreationService.batchProcessFoods(aiGeneratedFoods);
 *
 * // Processa un intero piano nutrizionale
 * const { plan, stats } = await FoodAutoCreationService.processNutritionPlan(nutritionPlan);
 * ```
 */
export declare class FoodAutoCreationService {
    /**
     * Processa batch di alimenti: match esistente o crea nuovo
     *
     * @param foods Array di alimenti da processare
     * @returns Mappa normalizedName -> FoodCreationResult
     */
    static batchProcessFoods(foods: ReadonlyArray<FoodToProcess>): Promise<BatchResolutionResult>;
    /**
     * Match o crea un singolo alimento
     *
     * Flusso:
     * 1. Cerca match esatto per nome normalizzato
     * 2. Se non trovato, cerca fuzzy match (nome + macros)
     * 3. Se score >= 85%, usa esistente
     * 4. Altrimenti, crea nuovo alimento con traduzioni
     */
    static matchOrCreateFood(food: FoodToProcess): Promise<FoodCreationResult>;
    /**
     * Crea un alimento nel database con tutte le traduzioni
     */
    private static createFoodInDatabase;
    /**
     * Trova o crea un brand
     */
    private static findOrCreateBrand;
    /**
     * Assicura che la description sia sempre valida (non null/empty)
     */
    private static ensureValidDescription;
    /**
     * Trova il miglior match tra i risultati di ricerca
     */
    private static findBestMatch;
    /**
     * Calcola Levenshtein distance
     */
    private static levenshteinDistance;
    /**
     * Calcola similarità stringa (0-1)
     */
    private static stringSimilarity;
    /**
     * Calcola similarità macros (0-1)
     */
    private static macroSimilarity;
    /**
     * Processa un intero piano nutrizionale e risolve/crea tutti gli alimenti
     *
     * @param plan Piano nutrizionale dall'AI
     * @returns Piano aggiornato con foodItemId validi + statistiche
     */
    static processNutritionPlan(plan: NutritionPlan): Promise<{
        plan: NutritionPlan;
        stats: BatchResolutionResult;
    }>;
    /**
     * Valida che tutti gli alimenti in un piano abbiano foodItemId validi
     */
    static validatePlanFoods(plan: NutritionPlan): Promise<{
        valid: boolean;
        missingFoods: Array<{
            id: string;
            name: string;
            mealName: string;
            dayNumber: number;
        }>;
    }>;
    /**
     * Converte array di AIGeneratedFood in FoodToProcess
     * Valida ogni food con lo schema SSOT
     */
    static convertAIFoodsToProcess(aiFoods: ReadonlyArray<Partial<AIGeneratedFood>>): FoodToProcess[];
}
export default FoodAutoCreationService;
