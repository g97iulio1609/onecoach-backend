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
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';
export interface RealtimePayload<T = Record<string, unknown>> {
    eventType: RealtimeEventType;
    new: T;
    old: T;
}
export interface RealtimeListener<T = Record<string, unknown>> {
    id: string;
    onInsert?: (record: T) => void;
    onUpdate?: (record: T) => void;
    onDelete?: (record: T) => void;
    onError?: (error: Error) => void;
}
interface Subscription {
    channel: RealtimeChannel;
    table: string;
    filter?: string;
    listeners: Map<string, RealtimeListener>;
}
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export interface RealtimeState {
    /** Client Supabase inizializzato */
    client: SupabaseClient | null;
    /** Stato della connessione */
    status: ConnectionStatus;
    /** Mappa delle sottoscrizioni attive */
    subscriptions: Map<string, Subscription>;
    /** Ultimo errore */
    lastError: Error | null;
}
export interface RealtimeActions {
    /** Inizializza lo store con il client Supabase autenticato */
    initialize: (client: SupabaseClient) => void;
    /** Resetta lo store (logout) */
    reset: () => void;
    /**
     * Sottoscrive a una tabella.
     * Se esiste già una sottoscrizione per la stessa tabella/filtro,
     * aggiunge solo il listener senza creare un nuovo canale.
     *
     * @returns Funzione di cleanup per rimuovere il listener
     */
    subscribe: <T = Record<string, unknown>>(table: string, listener: Omit<RealtimeListener<T>, 'id'>, options?: {
        filter?: string;
    }) => () => void;
    /** Ottiene info di debug sulle sottoscrizioni attive */
    getDebugInfo: () => {
        status: ConnectionStatus;
        subscriptionCount: number;
        subscriptions: Record<string, {
            listenerCount: number;
            filter?: string;
        }>;
    };
}
export type RealtimeStore = RealtimeState & RealtimeActions;
export declare const useRealtimeStore: import("zustand").UseBoundStore<Omit<Omit<import("zustand").StoreApi<RealtimeStore>, "setState" | "devtools"> & {
    setState(partial: RealtimeStore | Partial<RealtimeStore> | ((state: RealtimeStore) => RealtimeStore | Partial<RealtimeStore>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    setState(state: RealtimeStore | ((state: RealtimeStore) => RealtimeStore), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    devtools: {
        cleanup: () => void;
    };
}, "subscribe"> & {
    subscribe: {
        (listener: (selectedState: RealtimeStore, previousSelectedState: RealtimeStore) => void): () => void;
        <U>(selector: (state: RealtimeStore) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: ((a: U, b: U) => boolean) | undefined;
            fireImmediately?: boolean;
        } | undefined): () => void;
    };
}>;
/** Selettore per lo stato di connessione */
export declare const selectRealtimeStatus: (state: RealtimeStore) => ConnectionStatus;
/** Selettore per verificare se è connesso */
export declare const selectIsRealtimeReady: (state: RealtimeStore) => boolean;
/** Selettore per l'ultimo errore */
export declare const selectRealtimeError: (state: RealtimeStore) => Error | null;
export {};
//# sourceMappingURL=realtime.store.d.ts.map