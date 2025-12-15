/**
 * Food React Query Hooks
 *
 * Custom hooks for food-related queries and mutations
 */
import type { FoodListParams } from '../food';
/**
 * Hook to get all foods with optional filters
 * Optimized for admin panel with longer cache
 */
export declare function useFoods(params?: FoodListParams): import("@tanstack/react-query").UseQueryResult<import("..").FoodsResponse, Error>;
/**
 * Hook to get a food by ID
 */
export declare function useFood(id: string | null | undefined): import("@tanstack/react-query").UseQueryResult<import("..").FoodResponse, Error>;
/**
 * Hook to create a food
 */
export declare function useCreateFood(): import("@tanstack/react-query").UseMutationResult<import("..").FoodResponse, Error, unknown, unknown>;
/**
 * Hook to update a food
 */
export declare function useUpdateFood(): import("@tanstack/react-query").UseMutationResult<import("..").FoodResponse, Error, {
    id: string;
    data: unknown;
}, unknown>;
/**
 * Hook to delete a food
 */
export declare function useDeleteFood(): import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
/**
 * Hook to update a food using AI
 */
export declare function useUpdateFoodWithAI(): import("@tanstack/react-query").UseMutationResult<import("..").FoodResponse, Error, {
    id: string;
    data: {
        description: string;
        customPrompt?: string;
    };
}, unknown>;
//# sourceMappingURL=use-food.d.ts.map