/**
 * useFetch Hook
 *
 * Generic hook for data fetching when React Query hooks don't exist
 * Follows KISS, SOLID, DRY principles
 *
 * Use this only when:
 * - No React Query hook exists for the endpoint
 * - You need a one-off fetch that doesn't need caching
 * - You're migrating from manual fetch and will create a proper hook later
 */
'use client';
import { useState, useEffect, useCallback } from 'react';
import { handleApiError } from '@onecoach/lib-shared/utils/api-error-handler';
/**
 * Generic fetch hook
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useFetch<User>({
 *   url: '/api/user/123',
 *   enabled: !!userId,
 * });
 * ```
 */
export function useFetch(options) {
    const { url, enabled = true, onSuccess, onError, transform } = options;
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchData = useCallback(async () => {
        if (!enabled || !url) {
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(url, {
                credentials: 'include',
            });
            if (!response.ok) {
                const apiError = await handleApiError(response);
                throw apiError;
            }
            const jsonData = await response.json();
            const transformedData = transform ? transform(jsonData) : jsonData;
            setData(transformedData);
            onSuccess?.(transformedData);
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
            onError?.(error);
        }
        finally {
            setIsLoading(false);
        }
    }, [url, enabled, transform, onSuccess, onError]);
    useEffect(() => {
        void fetchData();
    }, [fetchData]);
    return {
        data,
        isLoading,
        error,
        refetch: fetchData,
    };
}
