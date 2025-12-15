export declare const bodyMeasurementsKeys: {
    all: readonly ["body-measurements"];
    list: (userId?: string) => readonly ["body-measurements", "list", string];
    latest: (userId?: string) => readonly ["body-measurements", "latest", string];
    detail: (measurementId: string) => readonly ["body-measurements", "detail", string];
};
interface UseBodyMeasurementsRealtimeOptions {
    /** User ID to filter measurements by */
    userId?: string;
    /** Enable/disable subscription */
    enabled?: boolean;
}
/**
 * Hook for real-time sync of body measurements list.
 * Updates both React Query cache and Zustand store.
 */
export declare function useBodyMeasurementsRealtime({ userId, enabled, }?: UseBodyMeasurementsRealtimeOptions): void;
/**
 * Combined hook for all body measurements realtime functionality.
 * Use this in _app or layout to enable realtime sync.
 */
export declare function useAllBodyMeasurementsRealtime(userId?: string): void;
export {};
//# sourceMappingURL=body-measurements.hooks.d.ts.map