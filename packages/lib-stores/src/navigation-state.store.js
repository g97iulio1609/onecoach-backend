import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
export const useNavigationStateStore = create()(devtools(persist((set, get) => ({
    states: {},
    saveState: (key, state) => {
        set((prev) => ({
            states: {
                ...prev.states,
                [key]: state,
            },
        }));
    },
    getState: (key) => {
        return get().states[key];
    },
    clearState: (key) => {
        set((prev) => {
            // Creiamo una copia shallow
            const newStates = { ...prev.states };
            // Eliminiamo la chiave
            delete newStates[key];
            return { states: newStates };
        });
    },
    clearAll: () => {
        set({ states: {} });
    },
}), {
    name: 'navigation-storage', // nome univoco per il localStorage/sessionStorage
    storage: createJSONStorage(() => sessionStorage), // Usa sessionStorage (reset alla chiusura tab)
    partialize: (state) => ({ states: state.states }), // Persisti solo l'oggetto states
}), { name: 'NavigationStateStore' }));
