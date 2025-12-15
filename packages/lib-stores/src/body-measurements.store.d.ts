import type { BodyMeasurement } from '@onecoach/types';
interface BodyMeasurementsState {
    /** All measurements (sorted by date, newest first) */
    measurements: BodyMeasurement[];
    /** Latest measurement (convenience accessor) */
    latest: BodyMeasurement | null;
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: string | null;
}
interface BodyMeasurementsActions {
    /** Set all measurements (from initial fetch) */
    setMeasurements: (measurements: BodyMeasurement[]) => void;
    /** Handle Realtime INSERT */
    handleRealtimeInsert: (measurement: BodyMeasurement) => void;
    /** Handle Realtime UPDATE */
    handleRealtimeUpdate: (measurement: BodyMeasurement) => void;
    /** Handle Realtime DELETE */
    handleRealtimeDelete: (measurementId: string) => void;
    /** Set loading state */
    setLoading: (loading: boolean) => void;
    /** Set error state */
    setError: (error: string | null) => void;
    /** Reset store */
    reset: () => void;
}
type BodyMeasurementsStore = BodyMeasurementsState & BodyMeasurementsActions;
export declare const useBodyMeasurementsStore: import("zustand").UseBoundStore<import("zustand").StoreApi<BodyMeasurementsStore>>;
export declare const selectLatestMeasurement: (state: BodyMeasurementsStore) => BodyMeasurement;
export declare const selectAllMeasurements: (state: BodyMeasurementsStore) => BodyMeasurement[];
export declare const selectMeasurementsLoading: (state: BodyMeasurementsStore) => boolean;
export {};
//# sourceMappingURL=body-measurements.store.d.ts.map