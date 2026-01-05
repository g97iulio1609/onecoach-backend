/**
 * Generic Versioning Actions Factory
 *
 * Creates save/get actions for any domain's version history.
 * Follows DRY principle - single implementation for Workout, Nutrition, and Projects.
 *
 * @example
 * const { saveVersion, getVersions } = createVersioningActions({
 *   tableName: 'workout_program_versions',
 *   entityIdField: 'programId',
 *   maxVersions: 20,
 * });
 */
export type VersioningConfig<T> = {
    /** Prisma model name (e.g., 'workout_program_versions') */
    tableName: 'workout_program_versions' | 'nutrition_plan_versions' | 'oneagenda_project_versions';
    /** Field name for entity ID (e.g., 'programId', 'planId', 'projectId') */
    entityIdField: 'programId' | 'planId' | 'projectId';
    /** Maximum versions to retain */
    maxVersions: number;
    /** Map state to Prisma create input */
    stateToCreateInput: (state: T, entityId: string, version: number, changeLog: string, userId: string) => Record<string, unknown>;
    /** Map DB record to VersionSnapshot-like structure */
    recordToSnapshot: (record: Record<string, unknown>) => {
        timestamp: number;
        description: string;
        state: T;
    };
};
/**
 * Saves a new version of an entity.
 */
export declare function saveVersion<T>(config: VersioningConfig<T>, entityId: string, state: T, changeLog: string, userId: string): Promise<{
    success: boolean;
    version?: number;
    error?: string;
}>;
/**
 * Retrieves version history for an entity.
 */
export declare function getVersions<T>(config: VersioningConfig<T>, entityId: string): Promise<Array<{
    timestamp: number;
    description: string;
    state: T;
}>>;
