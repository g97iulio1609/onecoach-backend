/**
 * Realtime Hooks
 *
 * Hook React per interagire con lo store Realtime in modo pulito e type-safe.
 * Seguono i principi KISS e DRY, wrappando la logica comune.
 */
'use client';
import { useEffect, useRef, useCallback, useState } from 'react';
import { useRealtimeStore, selectIsRealtimeReady } from './realtime.store';
import { logger } from '@onecoach/lib-core';
/**
 * Hook per applicare animazioni "magiche" quando arrivano aggiornamenti Realtime.
 *
 * Le animazioni CSS sono definite in globals.css e includono:
 * - `glow`: effetto glow pulsante viola
 * - `shimmer`: shimmer che attraversa l'elemento
 * - `pulse`: scala leggermente l'elemento
 * - `border`: bordo gradient animato
 * - `ripple`: effetto ripple dal centro
 * - `update`: combinazione di glow + pulse (default)
 *
 * @example
 * ```tsx
 * // Uso base - trigger su cambio di data
 * const { animationClass, trigger } = useMagicAnimation();
 *
 * useEffect(() => {
 *   if (dataChanged) trigger();
 * }, [data, trigger]);
 *
 * return <div className={cn('card', animationClass)}>...</div>;
 * ```
 *
 * @example
 * ```tsx
 * // Con Realtime subscription
 * const { animationClass, trigger } = useMagicAnimation({ type: 'shimmer' });
 *
 * useRealtimeSubscription({
 *   table: 'workout_programs',
 *   filter: `id=eq.${programId}`,
 *   onUpdate: (data) => {
 *     updateLocalData(data);
 *     trigger(); // Mostra l'animazione magic
 *   },
 * });
 *
 * return <div className={cn('workout-card', animationClass)}>...</div>;
 * ```
 *
 * @example
 * ```tsx
 * // Con callback
 * const { animationClass, trigger } = useMagicAnimation({
 *   type: 'glow',
 *   duration: 2000,
 *   onStart: () => logger.warn('Animation started'),
 *   onEnd: () => logger.warn('Animation ended'),
 * });
 * ```
 */
export function useMagicAnimation(options = {}) {
    const { duration = 1500, type = 'update', onStart, onEnd } = options;
    const [isAnimating, setIsAnimating] = useState(false);
    const timeoutRef = useRef(null);
    // Classe CSS basata sul tipo
    const getAnimationClass = (animationType) => {
        switch (animationType) {
            case 'glow':
                return 'magic-glow';
            case 'shimmer':
                return 'magic-shimmer';
            case 'pulse':
                return 'magic-pulse';
            case 'border':
                return 'magic-border active';
            case 'ripple':
                return 'magic-ripple';
            case 'update':
            default:
                return 'magic-update';
        }
    };
    const trigger = useCallback(() => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsAnimating(true);
        onStart?.();
        timeoutRef.current = setTimeout(() => {
            setIsAnimating(false);
            onEnd?.();
        }, duration);
    }, [duration, onStart, onEnd]);
    const reset = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsAnimating(false);
    }, []);
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    return {
        isAnimating,
        animationClass: isAnimating ? getAnimationClass(type) : '',
        trigger,
        reset,
    };
}
/**
 * Hook che combina Realtime subscription con animazione magic.
 * Quando arriva un update, triggera automaticamente l'animazione.
 *
 * @example
 * ```tsx
 * const { animationClass } = useRealtimeWithMagic({
 *   table: 'nutrition_plans',
 *   filter: `id=eq.${planId}`,
 *   animationType: 'shimmer',
 *   onUpdate: (plan) => setLocalPlan(plan),
 * });
 *
 * return <div className={cn('plan-card', animationClass)}>...</div>;
 * ```
 */
export function useRealtimeWithMagic({ animationType = 'update', animationDuration = 1500, onInsert, onUpdate, onDelete, ...subscriptionOptions }) {
    const magic = useMagicAnimation({ type: animationType, duration: animationDuration });
    const isReady = useRealtimeStore(selectIsRealtimeReady);
    // Wrapper callbacks che triggerano l'animazione
    const handleInsert = useCallback((record) => {
        onInsert?.(record);
        magic.trigger();
    }, [onInsert, magic]);
    const handleUpdate = useCallback((record) => {
        onUpdate?.(record);
        magic.trigger();
    }, [onUpdate, magic]);
    const handleDelete = useCallback((record) => {
        onDelete?.(record);
        magic.trigger();
    }, [onDelete, magic]);
    useRealtimeSubscription({
        ...subscriptionOptions,
        onInsert: onInsert ? handleInsert : undefined,
        onUpdate: onUpdate ? handleUpdate : undefined,
        onDelete: onDelete ? handleDelete : undefined,
    });
    return {
        ...magic,
        isSubscribed: isReady && subscriptionOptions.enabled !== false,
    };
}
/**
 * Hook per sottoscrivere a eventi Realtime su una tabella.
 *
 * @example
 * ```tsx
 * useRealtimeSubscription({
 *   table: 'users',
 *   filter: userId ? `id=eq.${userId}` : undefined,
 *   enabled: !!userId,
 *   onUpdate: (user) => logger.warn('User updated:', user),
 * });
 * ```
 */
export function useRealtimeSubscription({ table, filter, enabled = true, onInsert, onUpdate, onDelete, onError, }) {
    const isReady = useRealtimeStore(selectIsRealtimeReady);
    const subscribe = useRealtimeStore((state) => state.subscribe);
    // Refs per callback stabili (evita re-sottoscrizioni)
    const callbacksRef = useRef({ onInsert, onUpdate, onDelete, onError });
    useEffect(() => {
        callbacksRef.current = { onInsert, onUpdate, onDelete, onError };
    }, [onInsert, onUpdate, onDelete, onError]);
    useEffect(() => {
        if (!isReady || !enabled) {
            return;
        }
        // Wrapper che usa sempre le callback più recenti
        const listener = {
            onInsert: (record) => callbacksRef.current.onInsert?.(record),
            onUpdate: (record) => callbacksRef.current.onUpdate?.(record),
            onDelete: (record) => callbacksRef.current.onDelete?.(record),
            onError: (error) => callbacksRef.current.onError?.(error),
        };
        const unsubscribe = subscribe(table, listener, { filter });
        return unsubscribe;
    }, [isReady, enabled, table, filter, subscribe]);
}
/**
 * Hook specializzato per sincronizzare un singolo campo di una tabella.
 *
 * @example
 * ```tsx
 * useSyncField({
 *   table: 'users',
 *   filter: `id=eq.${userId}`,
 *   enabled: !!userId,
 *   field: 'credits',
 *   currentValue: user?.credits,
 *   onSync: (credits) => updateUser({ credits }),
 * });
 * ```
 */
export function useSyncField({ table, filter, enabled = true, field, currentValue, onSync, onError, }) {
    const currentValueRef = useRef(currentValue);
    useEffect(() => {
        currentValueRef.current = currentValue;
    }, [currentValue]);
    const handleUpdate = useCallback((record) => {
        const newValue = record[field];
        if (newValue !== currentValueRef.current) {
            onSync(newValue);
        }
    }, [field, onSync]);
    useRealtimeSubscription({
        table,
        filter,
        enabled,
        onUpdate: handleUpdate,
        onError,
    });
}
/**
 * Hook per sincronizzazione VERA in tempo reale con React Query.
 *
 * A differenza di invalidation-based approaches, questo hook aggiorna
 * DIRETTAMENTE il cache di React Query, garantendo UI update istantanei.
 *
 * Supporta:
 * - INSERT: aggiunge il nuovo record alla lista nel cache
 * - UPDATE: sostituisce il record esistente con i dati aggiornati
 * - DELETE: rimuove il record dalla lista nel cache
 *
 * @example
 * ```tsx
 * // Lista di workout programs
 * const { data: programs } = useQuery({
 *   queryKey: ['workout-programs', userId],
 *   queryFn: () => fetchWorkoutPrograms(userId),
 * });
 *
 * // Sincronizzazione realtime
 * useRealtimeSync<WorkoutProgram>({
 *   table: 'workout_programs',
 *   queryKey: ['workout-programs', userId],
 *   filter: `user_id=eq.${userId}`,
 *   enabled: !!userId,
 * });
 * ```
 *
 * @example
 * ```tsx
 * // Con transform per mappare campi
 * useRealtimeSync<NutritionPlan>({
 *   table: 'nutrition_plans',
 *   queryKey: ['nutrition-plans', date],
 *   transform: (record) => ({
 *     ...record,
 *     createdAt: new Date(record.created_at as string),
 *   }),
 * });
 * ```
 */
export function useRealtimeSync({ table, queryKey, filter, enabled = true, transform, onError, onSynced, }) {
    const handleInsert = useCallback((rawRecord) => {
        const record = (transform ? transform(rawRecord) : rawRecord);
        // Usa global queryClient (deve essere impostato in _app o providers)
        const globalQueryClient = globalThis.queryClient;
        if (globalQueryClient) {
            globalQueryClient.setQueryData(queryKey, (oldData) => {
                if (!oldData)
                    return [record];
                // Evita duplicati
                if (oldData.some((item) => item.id === record.id))
                    return oldData;
                return [...oldData, record];
            });
            onSynced?.('INSERT', record);
        }
    }, [queryKey, transform, onSynced]);
    const handleUpdate = useCallback((rawRecord) => {
        const record = (transform ? transform(rawRecord) : rawRecord);
        const globalQueryClient = globalThis.queryClient;
        if (globalQueryClient) {
            globalQueryClient.setQueryData(queryKey, (oldData) => {
                if (!oldData)
                    return [record];
                return oldData.map((item) => (item.id === record.id ? record : item));
            });
            onSynced?.('UPDATE', record);
        }
    }, [queryKey, transform, onSynced]);
    const handleDelete = useCallback((rawRecord) => {
        const record = (transform ? transform(rawRecord) : rawRecord);
        const globalQueryClient = globalThis.queryClient;
        if (globalQueryClient) {
            globalQueryClient.setQueryData(queryKey, (oldData) => {
                if (!oldData)
                    return [];
                return oldData.filter((item) => item.id !== record.id);
            });
            onSynced?.('DELETE', record);
        }
    }, [queryKey, transform, onSynced]);
    useRealtimeSubscription({
        table,
        filter,
        enabled,
        onInsert: handleInsert,
        onUpdate: handleUpdate,
        onDelete: handleDelete,
        onError,
    });
}
/**
 * Versione di useRealtimeSync che accetta un QueryClient esplicito.
 * Preferibile quando si ha accesso diretto al queryClient.
 *
 * @example
 * ```tsx
 * const queryClient = useQueryClient();
 *
 * useRealtimeSyncWithClient<WorkoutSession>({
 *   table: 'workout_sessions',
 *   queryKey: ['sessions', programId],
 *   queryClient,
 *   enabled: !!programId,
 * });
 * ```
 */
// --- Logger Factory ---
const createRealtimeLogger = (context) => {
    return {
        log: (message, data) => {
            if (process.env.NODE_ENV === 'development') {
                logger.info(`[Realtime][${context}] ${message}`, data !== undefined ? { data } : undefined);
            }
        },
        warn: (message, data) => {
            if (process.env.NODE_ENV === 'development') {
                logger.warn(`[Realtime][${context}] ${message}`, data !== undefined ? { data } : undefined);
            }
        },
        error: (message, error) => {
            logger.error(`[Realtime][${context}] ${message}`, error);
        },
    };
};
/**
 * Hook standardizzato per sincronizzare liste di record.
 * Gestisce automaticamente INSERT (append), UPDATE (replace), DELETE (remove).
 */
export function useRealtimeListSync({ table, queryKey, queryClient, filter, enabled = true, transform, onError, onSynced, }) {
    const logger = createRealtimeLogger(`ListSync:${table}`);
    const handleInsert = useCallback((rawRecord) => {
        const record = (transform ? transform(rawRecord) : rawRecord);
        queryClient.setQueryData(queryKey, (oldData) => {
            if (!oldData)
                return [record];
            // Evita duplicati
            if (oldData.some((item) => item.id === record.id))
                return oldData;
            return [...oldData, record];
        });
        logger.log('Synced INSERT', record.id);
        onSynced?.('INSERT', record);
    }, [queryClient, queryKey, transform, onSynced, logger]);
    const handleUpdate = useCallback((rawRecord) => {
        const record = (transform ? transform(rawRecord) : rawRecord);
        queryClient.setQueryData(queryKey, (oldData) => {
            if (!oldData)
                return [record];
            return oldData.map((item) => (item.id === record.id ? record : item));
        });
        logger.log('Synced UPDATE', record.id);
        onSynced?.('UPDATE', record);
    }, [queryClient, queryKey, transform, onSynced, logger]);
    const handleDelete = useCallback((rawRecord) => {
        const record = (transform ? transform(rawRecord) : rawRecord);
        queryClient.setQueryData(queryKey, (oldData) => {
            if (!oldData)
                return [];
            return oldData.filter((item) => item.id !== record.id);
        });
        logger.log('Synced DELETE', record.id);
        onSynced?.('DELETE', record);
    }, [queryClient, queryKey, transform, onSynced, logger]);
    useRealtimeSubscription({
        table,
        filter,
        enabled,
        onInsert: handleInsert,
        onUpdate: handleUpdate,
        onDelete: handleDelete,
        onError: (err) => {
            logger.error('Subscription error', err);
            onError?.(err);
        },
    });
}
/**
 * @deprecated Use useRealtimeListSync instead
 */
export const useRealtimeSyncWithClient = useRealtimeListSync;
/**
 * Hook per sincronizzare un SINGOLO record (non una lista).
 * Ideale per pagine di dettaglio.
 *
 * @example
 * ```tsx
 * const { data: workout } = useQuery({
 *   queryKey: ['workout', workoutId],
 *   queryFn: () => fetchWorkout(workoutId),
 * });
 *
 * const queryClient = useQueryClient();
 *
 * useRealtimeSyncSingle<WorkoutProgram>({
 *   table: 'workout_programs',
 *   recordId: workoutId,
 *   queryKey: ['workout', workoutId],
 *   queryClient,
 *   enabled: !!workoutId,
 * });
 * ```
 */
export function useRealtimeSyncSingle({ table, recordId, queryKey, queryClient, enabled = true, transform, onError, onSynced, }) {
    const filter = `id=eq.${recordId}`;
    const handleUpdate = useCallback((rawRecord) => {
        const record = (transform ? transform(rawRecord) : rawRecord);
        queryClient.setQueryData(queryKey, record);
        onSynced?.('UPDATE', record);
    }, [queryClient, queryKey, transform, onSynced]);
    const handleDelete = useCallback((rawRecord) => {
        const record = (transform ? transform(rawRecord) : rawRecord);
        queryClient.setQueryData(queryKey, null);
        onSynced?.('DELETE', record);
    }, [queryClient, queryKey, transform, onSynced]);
    useRealtimeSubscription({
        table,
        filter,
        enabled: enabled && !!recordId,
        onUpdate: handleUpdate,
        onDelete: handleDelete,
        onError,
    });
}
// ============================================================================
// useRealtimeStatus - Hook per lo stato della connessione
// ============================================================================
/**
 * Hook per ottenere lo stato della connessione Realtime.
 *
 * @example
 * ```tsx
 * const { isReady, status } = useRealtimeStatus();
 * if (!isReady) return <LoadingSpinner />;
 * ```
 */
export function useRealtimeStatus() {
    const status = useRealtimeStore((state) => state.status);
    const lastError = useRealtimeStore((state) => state.lastError);
    const reset = useRealtimeStore((state) => state.reset);
    return {
        status,
        isReady: status === 'connected',
        lastError,
        /** Forza reset della connessione */
        reconnect: reset,
    };
}
// ============================================================================
// useRealtimeDebug - Hook per debugging
// ============================================================================
/**
 * Hook per debugging delle sottoscrizioni Realtime.
 * Usa solo in development.
 *
 * @example
 * ```tsx
 * const debug = useRealtimeDebug();
 * logger.warn(debug);
 * // { status: 'connected', subscriptionCount: 2, subscriptions: {...} }
 * ```
 */
export function useRealtimeDebug() {
    const getDebugInfo = useRealtimeStore((state) => state.getDebugInfo);
    return getDebugInfo();
}
