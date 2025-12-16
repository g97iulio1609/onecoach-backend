/**
 * Metadata Validator Service
 *
 * Validates metadata names (localized or English) and returns their IDs.
 * This service ensures that all metadata references use IDs from the database,
 * preventing inconsistencies from manual input or AI-generated variations.
 */
/**
 * Validate equipment names and return their IDs
 * @param names Array of equipment names (can be localized or English)
 * @returns Array of valid equipment IDs (same order, filters out invalid names)
 */
export declare function validateEquipmentByName(names: string[]): Promise<string[]>;
/**
 * Validate muscle names and return their IDs
 */
export declare function validateMusclesByName(names: string[]): Promise<string[]>;
/**
 * Validate body part names and return their IDs
 */
export declare function validateBodyPartsByName(names: string[]): Promise<string[]>;
/**
 * Validate exercise type name and return its ID
 * @param name - Exercise type name to validate
 * @param sharedContext - Optional shared context from OneAgent SDK to avoid duplicate creation across parallel batches
 */
export declare function validateExerciseTypeByName(name: string, sharedContext?: {
    metadata?: {
        createdExerciseTypes?: Record<string, string>;
    };
}): Promise<string | null>;
//# sourceMappingURL=metadata-validator.service.d.ts.map