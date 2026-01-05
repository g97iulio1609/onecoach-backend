import { create } from 'zustand';
export const useHeaderActions = create((set) => ({
    actions: null,
    leftContent: null,
    setActions: (actions) => set({ actions }),
    setLeftContent: (leftContent) => set({ leftContent }),
}));
