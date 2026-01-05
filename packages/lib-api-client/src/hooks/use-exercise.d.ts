/**
 * Exercise React Query Hooks
 *
 * Custom hooks for exercise-related queries and mutations
 */
import type { ExercisesResponse, ExerciseListParams } from '../exercise';
/**
 * Hook to get all exercises with optional filters
 * Optimized for admin panel with longer cache
 */
export declare function useExercises(params?: ExerciseListParams, initialData?: ExercisesResponse): import("@tanstack/react-query").UseQueryResult<ExercisesResponse, Error>;
/**
 * Hook to get an exercise by ID
 */
export declare function useExercise(id: string | null | undefined): import("@tanstack/react-query").UseQueryResult<import("..").ExerciseResponse, Error>;
/**
 * Hook to create an exercise
 */
export declare function useCreateExercise(): import("@tanstack/react-query").UseMutationResult<import("..").ExerciseResponse, Error, unknown, unknown>;
/**
 * Hook to update an exercise
 */
export declare function useUpdateExercise(): import("@tanstack/react-query").UseMutationResult<import("..").ExerciseResponse, Error, {
    id: string;
    data: unknown;
}, unknown>;
/**
 * Hook to delete an exercise
 */
export declare function useDeleteExercise(): import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
/**
 * Hook for batch operations (approve, reject, delete)
 * Implements optimistic updates for immediate UI feedback
 */
export declare function useBatchExerciseOperations(): import("@tanstack/react-query").UseMutationResult<{
    success: boolean;
    results: Array<{
        id: string;
        success: boolean;
        error?: string;
    }>;
    updated?: number;
    deleted?: number;
    status?: string;
}, Error, {
    action: "approve" | "reject" | "delete";
    ids: string[];
}, {
    previousQueries: Map<any, any>;
}>;
//# sourceMappingURL=use-exercise.d.ts.map