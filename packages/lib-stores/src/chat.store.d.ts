/**
 * Chat Store
 *
 * Zustand store per gestione centralizzata della chat.
 * Funge da SSOT (Single Source of Truth) per:
 * - Lista conversazioni
 * - Conversazione corrente
 * - Messaggi (sincronizzati con AI SDK)
 * - Stati UI (loading, deleting, etc.)
 *
 * PRINCIPI:
 * - KISS: Stato semplice e prevedibile
 * - SOLID: Single Responsibility - solo stato chat
 * - DRY: Azioni riutilizzabili
 */
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    createdAt?: Date;
    metadata?: Record<string, unknown>;
}
export interface ChatConversation {
    id: string;
    title: string;
    preview: string;
    updatedAt: Date;
    domain?: string;
    metadata?: Record<string, unknown>;
}
export interface ChatState {
    /** Lista delle conversazioni dell'utente */
    conversations: ChatConversation[];
    /** ID della conversazione corrente */
    currentConversationId: string | null;
    /** Messaggi della conversazione corrente (managed by AI SDK, synced here) */
    messages: ChatMessage[];
    /** Input corrente dell'utente */
    input: string;
    /** Se sta inviando un messaggio */
    isLoading: boolean;
    /** Se sta eliminando conversazioni */
    isDeleting: boolean;
    /** Ultimo errore */
    lastError: string | null;
    /** User ID corrente */
    userId: string | null;
}
export interface ChatActions {
    /** Inizializza lo store con userId */
    initialize: (userId: string) => void;
    /** Reset dello store (logout) */
    reset: () => void;
    /** Imposta la lista conversazioni */
    setConversations: (conversations: ChatConversation[]) => void;
    /** Aggiunge una conversazione alla lista */
    addConversation: (conversation: ChatConversation) => void;
    /** Aggiorna una conversazione esistente */
    updateConversation: (id: string, updates: Partial<ChatConversation>) => void;
    /** Rimuove una conversazione dalla lista */
    removeConversation: (id: string) => void;
    /** Rimuove più conversazioni */
    removeConversations: (ids: string[]) => void;
    /** Svuota tutte le conversazioni */
    clearConversations: () => void;
    /** Imposta la conversazione corrente */
    setCurrentConversation: (id: string | null) => void;
    /** Imposta i messaggi (chiamato da AI SDK sync) */
    setMessages: (messages: ChatMessage[]) => void;
    /** Aggiunge un messaggio */
    addMessage: (message: ChatMessage) => void;
    /** Aggiorna un messaggio esistente */
    updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
    /** Rimuove un messaggio */
    removeMessage: (id: string) => void;
    /** Svuota i messaggi */
    clearMessages: () => void;
    /** Imposta l'input dell'utente */
    setInput: (input: string) => void;
    /** Imposta stato loading */
    setIsLoading: (loading: boolean) => void;
    /** Imposta stato deleting */
    setIsDeleting: (deleting: boolean) => void;
    /** Imposta errore */
    setError: (error: string | null) => void;
    /** Fetch delle conversazioni dal server */
    fetchConversations: () => Promise<void>;
    /** Carica una conversazione specifica con i suoi messaggi */
    loadConversation: (conversationId: string) => Promise<void>;
    /** Elimina una conversazione */
    deleteConversation: (id: string) => Promise<void>;
    /** Elimina più conversazioni */
    deleteConversations: (ids: string[]) => Promise<void>;
    /** Elimina tutte le conversazioni */
    deleteAllConversations: () => Promise<void>;
    /** Rinomina una conversazione */
    renameConversation: (id: string, title: string) => Promise<void>;
    /** Inizia una nuova conversazione */
    startNewConversation: () => void;
}
export type ChatStore = ChatState & ChatActions;
export declare const useChatStore: import("zustand").UseBoundStore<Omit<Omit<import("zustand").StoreApi<ChatStore>, "setState" | "devtools"> & {
    setState(partial: ChatStore | Partial<ChatStore> | ((state: ChatStore) => ChatStore | Partial<ChatStore>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    setState(state: ChatStore | ((state: ChatStore) => ChatStore), replace: true, action?: (string | {
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
        (listener: (selectedState: ChatStore, previousSelectedState: ChatStore) => void): () => void;
        <U>(selector: (state: ChatStore) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: ((a: U, b: U) => boolean) | undefined;
            fireImmediately?: boolean;
        } | undefined): () => void;
    };
}>;
/** Selettore per le conversazioni */
export declare const selectConversations: (state: ChatStore) => ChatConversation[];
/** Selettore per la conversazione corrente */
export declare const selectCurrentConversationId: (state: ChatStore) => string | null;
/** Selettore per i messaggi */
export declare const selectMessages: (state: ChatStore) => ChatMessage[];
/** Selettore per l'input */
export declare const selectInput: (state: ChatStore) => string;
/** Selettore per loading state */
export declare const selectIsLoading: (state: ChatStore) => boolean;
/** Selettore per deleting state */
export declare const selectIsDeleting: (state: ChatStore) => boolean;
/** Selettore per l'ultimo errore */
export declare const selectLastError: (state: ChatStore) => string | null;
/** Selettore per verificare se c'è una conversazione attiva */
export declare const selectHasActiveConversation: (state: ChatStore) => boolean;
/** Selettore per la conversazione corrente (oggetto completo) */
export declare const selectCurrentConversation: (state: ChatStore) => ChatConversation | null | undefined;
/** Selettore per verificare se ci sono conversazioni */
export declare const selectHasConversations: (state: ChatStore) => boolean;
/** Selettore per il conteggio delle conversazioni */
export declare const selectConversationsCount: (state: ChatStore) => number;
/** Selettore per il conteggio dei messaggi nella conversazione corrente */
export declare const selectMessageCount: (state: ChatStore) => number;
//# sourceMappingURL=chat.store.d.ts.map