/**
 * Projects React Query Hooks
 *
 * Custom hooks for projects with TanStack Query
 */
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../projects';
import { getErrorMessage } from '../utils/error';
import { logger } from '@onecoach/lib-core';
/**
 * Query keys for projects
 */
export const projectsKeys = {
    all: ['projects'],
    lists: () => [...projectsKeys.all, 'list'],
    list: (filters) => [...projectsKeys.lists(), filters],
    details: () => [...projectsKeys.all, 'detail'],
    detail: (id) => [...projectsKeys.details(), id],
};
/**
 * Hook to get all projects
 */
export function useProjects() {
    return useQuery({
        queryKey: projectsKeys.list(),
        queryFn: async () => {
            const response = await projectsApi.getAll();
            return response;
        },
        staleTime: 30 * 1000, // 30 seconds
    });
}
/**
 * Hook to get a single project by ID
 */
export function useProject(id) {
    return useQuery({
        queryKey: projectsKeys.detail(id || ''),
        queryFn: async () => {
            if (!id)
                throw new Error('Project ID is required');
            const response = await projectsApi.getById(id);
            return response;
        },
        enabled: !!id,
        staleTime: 30 * 1000,
    });
}
/**
 * Hook to create a project
 */
export function useCreateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input) => projectsApi.create(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
        },
        onError: (error) => {
            logger.error('Failed to create project:', getErrorMessage(error));
        },
    });
}
/**
 * Hook to update a project
 */
export function useUpdateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }) => projectsApi.update(id, input),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
            queryClient.invalidateQueries({ queryKey: projectsKeys.detail(variables.id) });
        },
        onError: (error) => {
            logger.error('Failed to update project:', getErrorMessage(error));
        },
    });
}
/**
 * Hook to delete a project
 */
export function useDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => projectsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
        },
        onError: (error) => {
            logger.error('Failed to delete project:', getErrorMessage(error));
        },
    });
}
/**
 * Hook to duplicate a project
 */
export function useDuplicateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => projectsApi.duplicate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
        },
        onError: (error) => {
            logger.error('Failed to duplicate project:', getErrorMessage(error));
        },
    });
}
