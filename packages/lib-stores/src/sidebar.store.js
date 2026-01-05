import { create } from 'zustand';
export const useSidebarStore = create((set) => ({
    extraContent: null,
    setExtraContent: (content) => set({ extraContent: content }),
}));
