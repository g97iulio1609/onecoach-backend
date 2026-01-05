'use client';
/**
 * Body Measurements Store
 *
 * Zustand store for managing body measurement state with Realtime sync.
 * Each measurement entry is a version, providing built-in history.
 *
 * SSOT: Types imported from @onecoach/types
 */
import { create } from 'zustand';
const initialState = {
    measurements: [],
    latest: null,
    isLoading: false,
    error: null,
};
/**
 * Helper to sort measurements by date (newest first) and extract latest
 */
function processAndSort(measurements) {
    const sorted = [...measurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return {
        sorted,
        latest: sorted[0] ?? null,
    };
}
export const useBodyMeasurementsStore = create((set) => ({
    ...initialState,
    setMeasurements: (measurements) => {
        const { sorted, latest } = processAndSort(measurements);
        set({ measurements: sorted, latest, isLoading: false, error: null });
    },
    handleRealtimeInsert: (measurement) => {
        set((state) => {
            const newMeasurements = [measurement, ...state.measurements];
            const { sorted, latest } = processAndSort(newMeasurements);
            return { measurements: sorted, latest };
        });
    },
    handleRealtimeUpdate: (measurement) => {
        set((state) => {
            const newMeasurements = state.measurements.map((m) => m.id === measurement.id ? measurement : m);
            const { sorted, latest } = processAndSort(newMeasurements);
            return { measurements: sorted, latest };
        });
    },
    handleRealtimeDelete: (measurementId) => {
        set((state) => {
            const newMeasurements = state.measurements.filter((m) => m.id !== measurementId);
            const { sorted, latest } = processAndSort(newMeasurements);
            return { measurements: sorted, latest };
        });
    },
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    reset: () => set(initialState),
}));
// Selectors
export const selectLatestMeasurement = (state) => state.latest;
export const selectAllMeasurements = (state) => state.measurements;
export const selectMeasurementsLoading = (state) => state.isLoading;
