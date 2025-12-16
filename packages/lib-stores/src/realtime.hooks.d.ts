/**
 * Realtime Hooks
 *
 * Hook React per interagire con lo store Realtime in modo pulito e type-safe.
 * Seguono i principi KISS e DRY, wrappando la logica comune.
 */
export type MagicAnimationType = 'glow' | 'shimmer' | 'pulse' | 'border' | 'ripple' | 'update';
export interface UseMagicAnimationOptions {
    /** Durata dell'animazione in ms (default: 1500) */
    duration?: number;
    /** Tipo di animazione (default: 'update') */
    type?: MagicAnimationType;
    /** Callback quando l'animazione inizia */
    onStart?: () => void;
    /** Callback quando l'animazione finisce */
    onEnd?: () => void;
}
export interface UseMagicAnimationResult {
    /** Se l'animazione è attiva */
    isAnimating: boolean;
    /** Classe CSS da applicare all'elemento */
    animationClass: string;
    /** Trigger manuale dell'animazione */
    trigger: () => void;
    /** Resetta l'animazione */
    reset: () => void;
}
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
 *   onStart: () => console.warn('Animation started'),
 *   onEnd: () => console.warn('Animation ended'),
 * });
 * ```
 */
export declare function useMagicAnimation(options?: UseMagicAnimationOptions): UseMagicAnimationResult;
export interface UseRealtimeWithMagicOptions<T = Record<string, unknown>> extends UseRealtimeSubscriptionOptions<T> {
    /** Tipo di animazione magic */
    animationType?: MagicAnimationType;
    /** Durata animazione */
    animationDuration?: number;
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
export declare function useRealtimeWithMagic<T = Record<string, unknown>>({ animationType, animationDuration, onInsert, onUpdate, onDelete, ...subscriptionOptions }: UseRealtimeWithMagicOptions<T>): UseMagicAnimationResult & {
    isSubscribed: boolean;
};
export interface UseRealtimeSubscriptionOptions<T = Record<string, unknown>> {
    /** Nome della tabella da ascoltare */
    table: string;
    /** Filtro PostgREST (es: "id=eq.123") */
    filter?: string;
    /** Abilita/disabilita la sottoscrizione (default: true) */
    enabled?: boolean;
    /** Callback per INSERT */
    onInsert?: (record: T) => void;
    /** Callback per UPDATE */
    onUpdate?: (record: T) => void;
    /** Callback per DELETE */
    onDelete?: (record: T) => void;
    /** Callback per errori */
    onError?: (error: Error) => void;
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
 *   onUpdate: (user) => console.warn('User updated:', user),
 * });
 * ```
 */
export declare function useRealtimeSubscription<T = Record<string, unknown>>({ table, filter, enabled, onInsert, onUpdate, onDelete, onError, }: UseRealtimeSubscriptionOptions<T>): void;
export interface UseSyncFieldOptions<T, K extends keyof T> {
    /** Nome della tabella */
    table: string;
    /** Filtro PostgREST */
    filter?: string;
    /** Abilita/disabilita */
    enabled?: boolean;
    /** Campo da sincronizzare */
    field: K;
    /** Valore corrente (per evitare update inutili) */
    currentValue?: T[K];
    /** Callback quando il campo cambia */
    onSync: (value: T[K]) => void;
    /** Callback per errori */
    onError?: (error: Error) => void;
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
export declare function useSyncField<T extends Record<string, unknown>, K extends keyof T>({ table, filter, enabled, field, currentValue, onSync, onError, }: UseSyncFieldOptions<T, K>): void;
export interface UseRealtimeSyncOptions<T extends {
    id: string | number;
}> {
    /** Nome della tabella da sincronizzare */
    table: string;
    /** Query key React Query per il cache */
    queryKey: readonly unknown[];
    /** Filtro PostgREST opzionale (es: "user_id=eq.123") */
    filter?: string;
    /** Abilita/disabilita la sottoscrizione (default: true) */
    enabled?: boolean;
    /** Trasforma il record dal DB prima di salvarlo nel cache (opzionale) */
    transform?: (record: Record<string, unknown>) => T;
    /** Callback per errori */
    onError?: (error: Error) => void;
    /** Callback post-sync (opzionale, per logging o side effects) */
    onSynced?: (event: 'INSERT' | 'UPDATE' | 'DELETE', record: T) => void;
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
export declare function useRealtimeSync<T extends {
    id: string | number;
}>({ table, queryKey, filter, enabled, transform, onError, onSynced, }: UseRealtimeSyncOptions<T>): void;
export interface UseRealtimeSyncWithClientOptions<T extends {
    id: string | number;
}> extends Omit<UseRealtimeSyncOptions<T>, never> {
    /** QueryClient da React Query */
    queryClient: import('@tanstack/react-query').QueryClient;
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
export declare function useRealtimeSyncWithClient<T extends {
    id: string | number;
}>({ table, queryKey, queryClient, filter, enabled, transform, onError, onSynced, }: UseRealtimeSyncWithClientOptions<T>): void;
export interface UseRealtimeSyncSingleOptions<T extends {
    id: string | number;
}> {
    /** Nome della tabella */
    table: string;
    /** ID del record da osservare */
    recordId: string | number;
    /** Query key React Query */
    queryKey: readonly unknown[];
    /** QueryClient */
    queryClient: import('@tanstack/react-query').QueryClient;
    /** Abilita/disabilita */
    enabled?: boolean;
    /** Trasforma record */
    transform?: (record: Record<string, unknown>) => T;
    /** Callback errori */
    onError?: (error: Error) => void;
    /** Callback post-sync */
    onSynced?: (event: 'UPDATE' | 'DELETE', record: T) => void;
}
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
export declare function useRealtimeSyncSingle<T extends {
    id: string | number;
}>({ table, recordId, queryKey, queryClient, enabled, transform, onError, onSynced, }: UseRealtimeSyncSingleOptions<T>): void;
/**
 * Hook per ottenere lo stato della connessione Realtime.
 *
 * @example
 * ```tsx
 * const { isReady, status } = useRealtimeStatus();
 * if (!isReady) return <LoadingSpinner />;
 * ```
 */
export declare function useRealtimeStatus(): {
    status: import("./realtime.store").ConnectionStatus;
    isReady: boolean;
    lastError: Error | null;
    /** Forza reset della connessione */
    reconnect: () => void;
};
/**
 * Hook per debugging delle sottoscrizioni Realtime.
 * Usa solo in development.
 *
 * @example
 * ```tsx
 * const debug = useRealtimeDebug();
 * console.warn(debug);
 * // { status: 'connected', subscriptionCount: 2, subscriptions: {...} }
 * ```
 */
export declare function useRealtimeDebug(): {
    status: import("./realtime.store").ConnectionStatus;
    subscriptionCount: number;
    subscriptions: Record<string, {
        listenerCount: number;
        filter?: string;
    }>;
};
//# sourceMappingURL=realtime.hooks.d.ts.map