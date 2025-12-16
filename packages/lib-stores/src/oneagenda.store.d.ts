export type OneAgendaView = 'agenda' | 'projects' | 'habits' | 'gantt';
interface OneAgendaState {
    selectedDate: Date;
    view: OneAgendaView;
    quickActionDate: Date | null;
    taskStatusFilter?: string | null;
}
interface OneAgendaActions {
    setSelectedDate: (date: Date) => void;
    setView: (view: OneAgendaView) => void;
    setQuickActionDate: (date: Date | null) => void;
    setTaskStatusFilter: (status: string | null) => void;
    reset: () => void;
}
type OneAgendaStore = OneAgendaState & OneAgendaActions;
export declare const useOneAgendaStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<OneAgendaStore>, "subscribe"> & {
    subscribe: {
        (listener: (selectedState: OneAgendaStore, previousSelectedState: OneAgendaStore) => void): () => void;
        <U>(selector: (state: OneAgendaStore) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: ((a: U, b: U) => boolean) | undefined;
            fireImmediately?: boolean;
        } | undefined): () => void;
    };
}>;
export {};
//# sourceMappingURL=oneagenda.store.d.ts.map