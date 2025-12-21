/**
 * Metadata ID Resolver Service
 *
 * Resolves metadata IDs to localized names in batch for efficient display.
 * This service performs batch loading with IN clauses and uses caching
 * for improved performance.
 */
export interface MetadataIdInfo {
    id: string;
    name: string;
    localizedName: string;
}
export interface MetadataIdMap {
    equipment: Record<string, MetadataIdInfo>;
    muscles: Record<string, MetadataIdInfo>;
    bodyParts: Record<string, MetadataIdInfo>;
    exerciseTypes: Record<string, MetadataIdInfo>;
}
/**
 * Resolve metadata IDs in batch
 * @param ids Object containing arrays of IDs for each metadata type
 * @param locale Target locale for localization
 * @returns Map of ID → { id, name, localizedName } for each metadata type
 */
export declare function resolveMetadataBatch(ids: {
    equipment?: string[];
    muscles?: string[];
    bodyParts?: string[];
    exerciseTypes?: string[];
}, locale?: string): Promise<MetadataIdMap>;
/**
 * Build a map of ID → English name for AI consumption
 * @param type Metadata type
 * @param ids Array of metadata IDs
 * @returns Record mapping ID → English name
 */
export declare function buildIdMapForAI(type: 'equipment' | 'muscle' | 'bodyPart' | 'exerciseType', ids: string[]): Promise<Record<string, string>>;
