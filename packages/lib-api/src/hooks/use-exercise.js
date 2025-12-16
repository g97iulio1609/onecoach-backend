/**
 * Exercise React Query Hooks
 *
 * Custom hooks for exercise-related queries and mutations
 */
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseApi, } from '../exercise';
import { exerciseKeys, exerciseQueries } from '../queries/exercise.queries';
/**
 * Hook to get all exercises with optional filters
 * Optimized for admin panel with longer cache
 */
export function useExercises(params, initialData) {
    return useQuery({
        queryKey: exerciseKeys.list(params),
        queryFn: () => exerciseQueries.list(params),
        staleTime: 10 * 60 * 1000, // 10 minutes for admin
        gcTime: 30 * 60 * 1000, // 30 minutes cache
        refetchOnWindowFocus: false,
        // refetchOnMount: true di default - quando cambia la queryKey (es. page), rifa il fetch
        initialData: initialData,
    });
}
/**
 * Hook to get an exercise by ID
 */
export function useExercise(id) {
    return useQuery({
        queryKey: exerciseKeys.detail(id),
        queryFn: () => exerciseQueries.getById(id),
        enabled: !!id,
    });
}
/**
 * Hook to create an exercise
 */
export function useCreateExercise() {
    let queryClient;
    try {
        if (typeof window !== 'undefined') {
            queryClient = useQueryClient();
        }
    }
    catch (e) {
        // Ignore error during SSR
    }
    return useMutation({
        mutationFn: (data) => exerciseApi.create(data),
        onSuccess: () => {
            queryClient?.invalidateQueries({ queryKey: exerciseKeys.lists() });
        },
    });
}
/**
 * Hook to update an exercise
 */
export function useUpdateExercise() {
    let queryClient;
    try {
        if (typeof window !== 'undefined') {
            queryClient = useQueryClient();
        }
    }
    catch (e) {
        // Ignore error during SSR
    }
    return useMutation({
        mutationFn: ({ id, data }) => exerciseApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient?.invalidateQueries({ queryKey: exerciseKeys.lists() });
            queryClient?.invalidateQueries({ queryKey: exerciseKeys.detail(variables.id) });
        },
    });
}
/**
 * Hook to delete an exercise
 */
export function useDeleteExercise() {
    let queryClient;
    try {
        if (typeof window !== 'undefined') {
            queryClient = useQueryClient();
        }
    }
    catch (e) {
        // Ignore error during SSR
    }
    return useMutation({
        mutationFn: (id) => exerciseApi.delete(id),
        onSuccess: () => {
            queryClient?.invalidateQueries({ queryKey: exerciseKeys.lists() });
        },
    });
}
/**
 * Hook for batch operations (approve, reject, delete)
 *
 * NOTA: Non usa optimistic updates perché il realtime (Zustand) aggiorna
 * automaticamente il cache React Query quando le modifiche arrivano dal database.
 * Il realtime è gestito globalmente tramite useRealtimeSubscription che usa
 * useRealtimeStore (Zustand) per una singola subscription condivisa.
 */
export function useBatchExerciseOperations() {
    let queryClient;
    try {
        if (typeof window !== 'undefined') {
            queryClient = useQueryClient();
        }
    }
    catch (e) {
        // Ignore error during SSR
    }
    return useMutation({
        mutationFn: ({ action, ids }) => exerciseApi.batch(action, ids),
        onSuccess: () => {
            // Il realtime (Zustand) aggiornerà automaticamente il cache quando le modifiche
            // arrivano dal database. Invalidiamo per sicurezza in caso di problemi di sincronizzazione.
            queryClient?.invalidateQueries({ queryKey: exerciseKeys.lists() });
        },
    });
}
