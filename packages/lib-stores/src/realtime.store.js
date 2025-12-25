/**
 * Realtime Store
 *
 * Gestione centralizzata delle sottoscrizioni Supabase Realtime con Zustand.
 *
 * PRINCIPI:
 * - KISS: Una sola sottoscrizione per combinazione tabella/filtro
 * - SOLID: Single Responsibility - lo store gestisce solo stato Realtime
 * - DRY: I consumer registrano callback, lo store gestisce le sottoscrizioni
 *
 * ARCHITETTURA:
 * ```
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    useRealtimeStore                         │
 * │  ┌─────────────────────────────────────────────────────┐   │
 * │  │  subscriptions: Map<channelKey, Subscription>       │   │
 * │  │  ┌───────────────┐  ┌───────────────┐               │   │
 * │  │  │users:id=eq.1  │  │tasks:*        │               │   │
 * │  │  │ listeners: 2  │  │ listeners: 1  │               │   │
 * │  │  └───────────────┘  └───────────────┘               │   │
 * │  └─────────────────────────────────────────────────────┘   │
 * └─────────────────────────────────────────────────────────────┘
 *           │                      │
 *    useSyncCredits         useRealtimeInvalidator
 *    (sidebar)              (components)
 * ```
 */
'use client';
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { logger } from '@onecoach/lib-core';
// ============================================================================
// Helpers
// ============================================================================
let listenerId = 0;
const generateListenerId = () => `listener_${++listenerId}_${Date.now()}`;
const getChannelKey = (table, filter) => `${table}:${filter || '*'}`;
const getChannelName = (channelKey) => `realtime_${channelKey.replace(/[^a-zA-Z0-9]/g, '_')}`;
/**
 * Validates if a string is a valid UUID v4.
 * Supabase Realtime requires valid UUIDs for filtering.
 *
 * NOTE: Since 2024-12-02, all user IDs are native PostgreSQL UUIDs.
 * This validation is kept as a safety fallback for any legacy data.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isValidUUID = (value) => {
    return UUID_REGEX.test(value);
};
/**
 * Checks if a filter contains a valid value for Supabase Realtime.
 * Returns false for filters with non-UUID IDs (e.g., legacy user_123456_abc).
 *
 * NOTE: Since 2024-12-02, all new users have native UUID IDs.
 * This check handles any remaining legacy data gracefully.
 */
const isValidRealtimeFilter = (filter) => {
    if (!filter)
        return true; // No filter is valid (subscribes to all)
    // Check for eq. filters with ID-like values
    const eqMatch = filter.match(/=eq\.(.+)$/);
    if (eqMatch && eqMatch[1]) {
        const value = eqMatch[1];
        // If it looks like a legacy ID (contains underscore prefix patterns), validate as UUID
        if (value.includes('_') && !isValidUUID(value)) {
            return false;
        }
    }
    return true;
};
// ============================================================================
// Store
// ============================================================================
const initialState = {
    client: null,
    status: 'disconnected',
    subscriptions: new Map(),
    lastError: null,
};
export const useRealtimeStore = create()(devtools(subscribeWithSelector((set, get) => ({
    ...initialState,
    initialize: (client) => {
        const { status } = get();
        // Evita re-inizializzazioni
        if (status === 'connected' || status === 'connecting') {
            return;
        }
        set({
            client,
            status: 'connected',
            lastError: null,
        });
        if (process.env.NODE_ENV === 'development') {
            logger.warn('[RealtimeStore] Initialized');
        }
    },
    reset: () => {
        const { client, subscriptions } = get();
        // Chiudi tutti i canali
        subscriptions.forEach((sub) => {
            client?.removeChannel(sub.channel);
        });
        set({
            ...initialState,
            subscriptions: new Map(),
        });
        if (process.env.NODE_ENV === 'development') {
            logger.warn('[RealtimeStore] Reset');
        }
    },
    subscribe: (table, listener, options) => {
        const { client, subscriptions } = get();
        const filter = options?.filter;
        const channelKey = getChannelKey(table, filter);
        const id = generateListenerId();
        // Validate filter - skip subscription if filter contains invalid IDs
        // Supabase Realtime requires valid UUIDs for filtering
        if (!isValidRealtimeFilter(filter)) {
            if (process.env.NODE_ENV === 'development') {
                logger.warn(`[RealtimeStore] Skipping subscription for ${channelKey} - filter contains non-UUID value. ` +
                    'Realtime subscriptions require valid Supabase UUIDs.');
            }
            // Return empty cleanup function - subscription is silently skipped
            return () => { };
        }
        // Crea listener con ID
        const listenerWithId = { id, ...listener };
        const existingSub = subscriptions.get(channelKey);
        if (existingSub) {
            // Aggiungi listener a sottoscrizione esistente
            existingSub.listeners.set(id, listenerWithId);
            if (process.env.NODE_ENV === 'development') {
                logger.warn(`[RealtimeStore] Added listener to ${channelKey} (total: ${existingSub.listeners.size})`);
            }
        }
        else if (client) {
            // Crea nuova sottoscrizione
            const channelName = getChannelName(channelKey);
            const listeners = new Map();
            listeners.set(id, listenerWithId);
            const channel = client
                .channel(channelName)
                .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table,
                filter,
            }, (payload) => {
                // Propaga evento a tutti i listener
                const sub = get().subscriptions.get(channelKey);
                if (!sub)
                    return;
                sub.listeners.forEach((l) => {
                    try {
                        const typedPayload = payload;
                        switch (typedPayload.eventType) {
                            case 'INSERT':
                                l.onInsert?.(typedPayload.new);
                                break;
                            case 'UPDATE':
                                l.onUpdate?.(typedPayload.new);
                                break;
                            case 'DELETE':
                                l.onDelete?.(typedPayload.old);
                                break;
                        }
                    }
                    catch (error) {
                        logger.error('[RealtimeStore] Listener error:', error);
                        l.onError?.(error);
                    }
                });
            })
                .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    if (process.env.NODE_ENV === 'development') {
                        logger.warn(`[RealtimeStore] Subscribed to ${channelKey}`);
                    }
                }
                else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    // Crea un errore informativo solo se necessario
                    const error = err instanceof Error
                        ? err
                        : new Error(`Realtime ${status} on channel ${channelKey}${err ? `: ${String(err)}` : ''}`);
                    // Log solo in development per evitare spam nella console
                    if (process.env.NODE_ENV === 'development') {
                        logger.warn(`[RealtimeStore] ${status} on ${channelKey}:`, error.message);
                    }
                    // Aggiorna lo stato con l'errore
                    set({ lastError: error });
                    // Notifica errore a tutti i listener senza propagare eccezioni
                    const sub = get().subscriptions.get(channelKey);
                    sub?.listeners.forEach((l) => {
                        try {
                            l.onError?.(error);
                        }
                        catch (listenerError) {
                            // Log solo in development per evitare spam
                            if (process.env.NODE_ENV === 'development') {
                                logger.error('[RealtimeStore] Listener onError threw:', listenerError);
                            }
                        }
                    });
                    // Auto-cleanup failed subscription to prevent retries
                    if (status === 'CHANNEL_ERROR') {
                        const { client: c, subscriptions: subs } = get();
                        const failedSub = subs.get(channelKey);
                        if (failedSub) {
                            c?.removeChannel(failedSub.channel);
                            const newSubs = new Map(subs);
                            newSubs.delete(channelKey);
                            set({ subscriptions: newSubs });
                        }
                    }
                }
            });
            // Aggiungi alla mappa
            const newSubscriptions = new Map(subscriptions);
            newSubscriptions.set(channelKey, {
                channel,
                table,
                filter,
                listeners,
            });
            set({ subscriptions: newSubscriptions });
            if (process.env.NODE_ENV === 'development') {
                logger.warn(`[RealtimeStore] Created subscription: ${channelKey}`);
            }
        }
        // Cleanup function
        return () => {
            const { client, subscriptions } = get();
            const sub = subscriptions.get(channelKey);
            if (!sub)
                return;
            sub.listeners.delete(id);
            if (sub.listeners.size === 0) {
                // Nessun listener rimasto, chiudi canale
                client?.removeChannel(sub.channel);
                const newSubscriptions = new Map(subscriptions);
                newSubscriptions.delete(channelKey);
                set({ subscriptions: newSubscriptions });
                if (process.env.NODE_ENV === 'development') {
                    logger.warn(`[RealtimeStore] Removed subscription: ${channelKey}`);
                }
            }
            else if (process.env.NODE_ENV === 'development') {
                logger.warn(`[RealtimeStore] Removed listener from ${channelKey} (remaining: ${sub.listeners.size})`);
            }
        };
    },
    getDebugInfo: () => {
        const { status, subscriptions } = get();
        const subsInfo = {};
        subscriptions.forEach((sub, key) => {
            subsInfo[key] = {
                listenerCount: sub.listeners.size,
                filter: sub.filter,
            };
        });
        return {
            status,
            subscriptionCount: subscriptions.size,
            subscriptions: subsInfo,
        };
    },
})), {
    name: 'RealtimeStore',
    enabled: process.env.NODE_ENV === 'development',
}));
// ============================================================================
// Selectors (per ottimizzare re-render)
// ============================================================================
/** Selettore per lo stato di connessione */
export const selectRealtimeStatus = (state) => state.status;
/** Selettore per verificare se è connesso */
export const selectIsRealtimeReady = (state) => state.status === 'connected';
/** Selettore per l'ultimo errore */
export const selectRealtimeError = (state) => state.lastError;
// ============================================================================
// Debug helper (esposto su window in development)
// ============================================================================
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.__RealtimeStore =
        useRealtimeStore;
}
