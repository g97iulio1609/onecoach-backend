/**
 * Nutrition React Query Hooks
 *
 * Custom hooks for nutrition-related queries and mutations
 */
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nutritionApi } from '../nutrition';
import { nutritionKeys, nutritionQueries } from '../queries/nutrition.queries';
/**
 * Hook to get all nutrition plans
 */
export function useNutritionPlans() {
    return useQuery({
        queryKey: nutritionKeys.lists(),
        queryFn: nutritionQueries.getAll,
    });
}
/**
 * Hook to get a nutrition plan by ID
 */
export function useNutritionPlan(id) {
    return useQuery({
        queryKey: nutritionKeys.detail(id),
        queryFn: () => nutritionQueries.getById(id),
        enabled: !!id,
    });
}
/**
 * Hook to get nutrition plan versions
 */
export function useNutritionPlanVersions(id) {
    return useQuery({
        queryKey: nutritionKeys.versions(id),
        queryFn: () => nutritionQueries.getVersions(id),
        enabled: !!id,
    });
}
/**
 * Hook to get a nutrition day log by ID
 */
export function useNutritionDayLog(logId) {
    return useQuery({
        queryKey: nutritionKeys.log(logId),
        queryFn: () => nutritionQueries.getDayLog(logId),
        enabled: !!logId,
    });
}
/**
 * Hook to create a nutrition plan
 */
export function useCreateNutritionPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => nutritionApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: nutritionKeys.lists() });
        },
    });
}
/**
 * Hook to update a nutrition plan
 */
export function useUpdateNutritionPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => nutritionApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: nutritionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: nutritionKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: nutritionKeys.versions(variables.id) });
        },
    });
}
/**
 * Hook to delete a nutrition plan
 */
export function useDeleteNutritionPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => nutritionApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: nutritionKeys.lists() });
        },
    });
}
/**
 * Hook to create a nutrition day log
 */
export function useCreateNutritionDayLog() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ planId, data, }) => nutritionApi.createDayLog(planId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: nutritionKeys.logs() });
        },
    });
}
/**
 * Hook to update a nutrition day log
 */
export function useUpdateNutritionDayLog() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ logId, data }) => nutritionApi.updateDayLog(logId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: nutritionKeys.log(variables.logId),
            });
            queryClient.invalidateQueries({ queryKey: nutritionKeys.logs() });
        },
    });
}
