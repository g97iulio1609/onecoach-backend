/**
 * Exercise ID Resolver Service
 *
 * Resolves exercise IDs to localized names in batch.
 * Used when AI provides exerciseId references that need to be
 * displayed with localized names in the frontend.
 */
export interface ExerciseIdInfo {
    id: string;
    name: string;
    localizedName: string;
    slug?: string;
}
/**
 * Resolve exercise IDs to names in batch
 * @param ids Array of exercise IDs
 * @param locale Target locale for localization
 * @returns Record mapping exercise ID → { id, name, localizedName, slug }
 */
export declare function resolveExerciseIds(ids: string[], locale?: string): Promise<Record<string, ExerciseIdInfo>>;
/**
 * Resolve a single exercise ID to name
 * @param exerciseId Exercise ID
 * @param locale Target locale
 * @returns Exercise name or null if not found
 */
export declare function resolveExerciseName(exerciseId: string, locale?: string): Promise<string | null>;
/**
 * Build a map of exercise ID → English name for AI consumption
 * @param ids Array of exercise IDs
 * @returns Record mapping ID → English name
 */
export declare function buildExerciseIdMapForAI(ids: string[]): Promise<Record<string, string>>;
//# sourceMappingURL=exercise-id-resolver.service.d.ts.map