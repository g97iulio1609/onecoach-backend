/**
 * Profile API
 *
 * API functions per user profile data
 */
export interface OneRepMaxResponse {
    maxes: unknown[];
}
export interface UpsertOneRepMaxRequest {
    catalogExerciseId: string;
    oneRepMax: number;
    notes?: string | null;
}
export declare const profileApi: {
    /**
     * Get user one rep maxes
     */
    getOneRepMaxes(): Promise<OneRepMaxResponse>;
    /**
     * Upsert one rep max
     */
    upsertOneRepMax(data: UpsertOneRepMaxRequest): Promise<{
        max: unknown;
    }>;
    /**
     * Delete one rep max
     * @param catalogExerciseId - ID dell'esercizio nel catalogo
     */
    deleteOneRepMax(catalogExerciseId: string): Promise<void>;
};
//# sourceMappingURL=profile.d.ts.map