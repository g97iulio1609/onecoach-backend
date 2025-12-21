/**
 * Catalog Provider Service
 *
 * Provides intelligent exercise matching with duplicate prevention.
 * Manages the exercise catalog for AI agents.
 *
 * NOTE: Food creation logic is handled by FoodAutoCreationService (SSOT).
 * This service only provides food instructions helper.
 *
 * NOTE: This file does not use 'server-only' because it's exported from lib-metadata
 * which is imported by one-agent package used in client components. The service
 * methods themselves are only executed server-side when called from API routes
 * or server components.
 */
export interface ExerciseCatalogItem {
    id: string;
    name: string;
    muscleGroups: string[];
    equipment: string[];
    difficulty: string;
    category: string;
}
export declare class CatalogProviderService {
    /**
     * Calculate Levenshtein distance between two strings
     * Used for fuzzy string matching in exercise catalog
     */
    private static levenshteinDistance;
    /**
     * Calculate similarity score between two strings (0-1)
     * Higher score = more similar. Used for exercise name matching.
     */
    private static stringSimilarity;
    /**
     * Get cached exercise catalog for AI agents
     * Returns approved exercises with their IDs and metadata
     * Exercises are finite and well-defined, so catalog approach works well
     */
    static getExerciseCatalog(): Promise<ExerciseCatalogItem[]>;
    /**
     * Format exercise catalog as string for AI prompt inclusion
     * Optimized for token efficiency
     */
    static formatExerciseCatalogForPrompt(exercises: ExerciseCatalogItem[]): string;
    /**
     * Match exercise by name from catalog
     * Uses multi-layer matching:
     * 1. Exact name match (90% threshold)
     * 2. SearchTerms match (80% threshold) - aliases and variations
     *
     * Used when AI doesn't provide exerciseId
     */
    static matchExerciseByName(exerciseName: string): Promise<string | null>;
    /**
     * Match exercise using searchTerms field (aliases/variations)
     * Queries database for exercises with searchTerms containing similar strings
     */
    private static matchExerciseBySearchTerms;
    /**
     * Clear exercise cache (useful for testing or manual refresh)
     */
    static clearCache(): void;
    /**
     * Get instructions for AI on how to specify foods
     * Delegates to SSOT schema instructions
     * @deprecated Use AI_FOOD_GENERATION_INSTRUCTIONS directly from @onecoach/schemas
     */
    static getFoodInstructions(): string;
}
