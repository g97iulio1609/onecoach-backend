import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
const initialState = {
    selectedDate: new Date(),
    view: 'agenda',
    quickActionDate: null,
    taskStatusFilter: null,
};
export const useOneAgendaStore = create()(subscribeWithSelector((set) => ({
    ...initialState,
    setSelectedDate: (date) => set({ selectedDate: date }),
    setView: (view) => set({ view }),
    setQuickActionDate: (date) => set({ quickActionDate: date }),
    setTaskStatusFilter: (status) => set({ taskStatusFilter: status }),
    reset: () => set(initialState),
})));
