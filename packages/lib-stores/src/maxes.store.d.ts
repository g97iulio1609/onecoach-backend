/**
 * Maxes Store
 *
 * Gestione centralizzata dei massimali (1RM) con Zustand.
 * I tipi sono importati da @onecoach/types per SSOT.
 *
 * FUNZIONALITÀ:
 * - CRUD completo massimali
 * - Storico versioni per ogni massimale
 * - Integrazione Realtime Supabase
 * - Selettori ottimizzati
 */
import type { Max, MaxVersion } from '@onecoach/types';
export type { Max, MaxVersion, CreateMaxInput, UpdateMaxInput } from '@onecoach/types';
export interface MaxesState {
    /** Mappa dei massimali per exerciseId */
    maxes: Map<string, Max>;
    /** Storico versioni per exerciseId */
    history: Map<string, MaxVersion[]>;
    /** ExerciseId selezionato per il modal storia */
    selectedExerciseId: string | null;
    /** Modal storia aperto */
    isHistoryModalOpen: boolean;
    /** Modal aggiungi/modifica aperto */
    isEditModalOpen: boolean;
    /** Loading state */
    isLoading: boolean;
    /** Loading history */
    isLoadingHistory: boolean;
    /** Errore */
    error: string | null;
}
export interface MaxesActions {
    setMaxes: (maxes: Max[]) => void;
    addMax: (max: Max) => void;
    updateMax: (exerciseId: string, data: Partial<Max>) => void;
    removeMax: (exerciseId: string) => void;
    setHistory: (exerciseId: string, versions: MaxVersion[]) => void;
    clearHistory: (exerciseId: string) => void;
    openHistoryModal: (exerciseId: string) => void;
    closeHistoryModal: () => void;
    openEditModal: (exerciseId?: string) => void;
    closeEditModal: () => void;
    setLoading: (isLoading: boolean) => void;
    setLoadingHistory: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    handleRealtimeInsert: (record: Max) => void;
    handleRealtimeUpdate: (record: Max) => void;
    handleRealtimeDelete: (record: {
        exerciseId: string;
    }) => void;
    reset: () => void;
}
export type MaxesStore = MaxesState & MaxesActions;
export declare const useMaxesStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<MaxesStore>, "setState" | "devtools"> & {
    setState(partial: MaxesStore | Partial<MaxesStore> | ((state: MaxesStore) => MaxesStore | Partial<MaxesStore>), replace?: false, action?: string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }): void;
    setState(state: MaxesStore | ((state: MaxesStore) => MaxesStore), replace: true, action?: string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }): void;
    devtools: {
        cleanup: () => void;
    };
}>;
/** Ottieni tutti i massimali come array */
export declare const selectMaxesList: (state: MaxesStore) => Max[];
/** Ottieni massimale per exerciseId */
export declare const selectMaxByExerciseId: (state: MaxesStore, exerciseId: string) => Max | undefined;
/** Ottieni storico per exerciseId */
export declare const selectHistoryByExerciseId: (state: MaxesStore, exerciseId: string) => MaxVersion[];
/** Ottieni il massimale selezionato */
export declare const selectSelectedMax: (state: MaxesStore) => Max | undefined;
/** Controlla se ci sono massimali */
export declare const selectHasMaxes: (state: MaxesStore) => boolean;
/** Numero totale massimali */
export declare const selectMaxesCount: (state: MaxesStore) => number;
/** Massimali ordinati per nome esercizio */
export declare const selectMaxesSortedByName: (state: MaxesStore) => Max[];
/** Massimali ordinati per peso (decrescente) */
export declare const selectMaxesSortedByWeight: (state: MaxesStore) => Max[];
/** Massimali ordinati per data aggiornamento (più recenti prima) */
export declare const selectMaxesSortedByDate: (state: MaxesStore) => Max[];
/** Hook per ottenere un massimale specifico */
export declare const useMax: (exerciseId: string) => Max;
/** Hook per ottenere lo storico di un massimale */
export declare const useMaxHistory: (exerciseId: string) => MaxVersion[];
/** Hook per lo stato di loading */
export declare const useMaxesLoading: () => boolean;
/** Hook per l'errore */
export declare const useMaxesError: () => string;
//# sourceMappingURL=maxes.store.d.ts.map