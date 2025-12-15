/**
 * Workout React Query Hooks
 *
 * Custom hooks for workout-related queries and mutations
 */
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutApi } from '../workout';
import { workoutKeys, workoutQueries } from '../queries/workout.queries';
/**
 * Hook to get all workout programs
 */
export function useWorkouts() {
    return useQuery({
        queryKey: workoutKeys.lists(),
        queryFn: workoutQueries.getAll,
    });
}
/**
 * Hook to get a workout program by ID
 */
export function useWorkout(id) {
    return useQuery({
        queryKey: workoutKeys.detail(id),
        queryFn: () => workoutQueries.getById(id),
        enabled: !!id,
    });
}
/**
 * Hook to get a workout session by ID
 */
export function useWorkoutSession(sessionId) {
    return useQuery({
        queryKey: workoutKeys.session(sessionId),
        queryFn: () => workoutQueries.getSession(sessionId),
        enabled: !!sessionId,
    });
}
/**
 * Hook to create a workout program
 */
export function useCreateWorkout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => workoutApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: workoutKeys.lists() });
        },
    });
}
/**
 * Hook to update a workout program
 */
export function useUpdateWorkout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => workoutApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: workoutKeys.lists() });
            queryClient.invalidateQueries({ queryKey: workoutKeys.detail(variables.id) });
        },
    });
}
/**
 * Hook to delete a workout program
 */
export function useDeleteWorkout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => workoutApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: workoutKeys.lists() });
        },
    });
}
/**
 * Hook to create a workout session
 */
export function useCreateWorkoutSession() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ programId, data, }) => workoutApi.createSession(programId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: workoutKeys.sessions() });
        },
    });
}
/**
 * Hook to update a workout session
 */
export function useUpdateWorkoutSession() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ sessionId, data }) => workoutApi.updateSession(sessionId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: workoutKeys.session(variables.sessionId),
            });
            queryClient.invalidateQueries({ queryKey: workoutKeys.sessions() });
        },
    });
}
