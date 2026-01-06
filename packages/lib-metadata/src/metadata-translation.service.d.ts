/**
 * Metadata Translation Service
 *
 * Service for managing translations of exercise metadata entities:
 * - ExerciseTypes
 * - Muscles
 * - BodyParts
 * - Equipment
 * - WorkoutGoals
 *
 * NOTE: This file does not use 'server-only' because it's exported from lib-metadata
 * which may be imported in client components. The service methods themselves are
 * only executed server-side when called from API routes or server components.
 */
/**
 * Generic metadata with translations
 */
export interface MetadataWithTranslations {
    name: string;
    slug?: string;
    imageUrl?: string | null;
    translations?: Array<{
        locale: string;
        name: string;
        description?: string | null;
    }>;
}
/**
 * Get localized name for metadata entity
 * Uses a map for O(1) lookup instead of multiple array iterations
 */
export declare function getLocalizedName(entity: MetadataWithTranslations, locale?: string): string;
/**
 * Get all ExerciseTypes with translations
 */
export declare function getExerciseTypesWithTranslations(locale?: string): Promise<{
    id: string;
    name: string;
    slug: undefined;
    imageUrl: string | null;
    localizedName: string;
    translations: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        exerciseTypeId: string;
        locale: string;
    }[];
}[]>;
/**
 * Get all Muscles with translations
 */
export declare function getMusclesWithTranslations(locale?: string): Promise<{
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    localizedName: string;
    translations: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        locale: string;
        muscleId: string;
    }[];
}[]>;
/**
 * Get all BodyParts with translations
 */
export declare function getBodyPartsWithTranslations(locale?: string): Promise<{
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    localizedName: string;
    translations: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        locale: string;
        bodyPartId: string;
    }[];
}[]>;
/**
 * Get all Equipment with translations
 */
export declare function getEquipmentWithTranslations(locale?: string): Promise<{
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    localizedName: string;
    translations: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        locale: string;
        equipmentId: string;
    }[];
}[]>;
/**
 * Get all WorkoutGoals with translations
 */
export declare function getWorkoutGoalsWithTranslations(locale?: string): Promise<{
    id: string;
    name: string;
    slug: string;
    localizedName: string;
    translations: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        locale: string;
        workoutGoalId: string;
    }[];
}[]>;
/**
 * Create or update ExerciseType translation
 */
export declare function upsertExerciseTypeTranslation(exerciseTypeId: string, locale: string, name: string, description?: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    exerciseTypeId: string;
    locale: string;
}>;
/**
 * Create or update Muscle translation
 */
export declare function upsertMuscleTranslation(muscleId: string, locale: string, name: string, description?: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    locale: string;
    muscleId: string;
}>;
/**
 * Create or update BodyPart translation
 */
export declare function upsertBodyPartTranslation(bodyPartId: string, locale: string, name: string, description?: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    locale: string;
    bodyPartId: string;
}>;
/**
 * Create or update Equipment translation
 */
export declare function upsertEquipmentTranslation(equipmentId: string, locale: string, name: string, description?: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    locale: string;
    equipmentId: string;
}>;
/**
 * Verifica se una stringa è un ID (CUID) o un nome
 * I CUIDs tipicamente iniziano con 'c' e hanno una lunghezza di ~25 caratteri
 * I workout goal IDs iniziano con 'clx_goal_'
 */
export declare function isMetadataId(value: string, prefix?: string): boolean;
/**
 * Converte array di workout goal names → IDs
 * Se alcuni valori sono già ID, li mantiene.
 * Se alcuni valori sono nomi, li converte in ID cercando per name nel database.
 * @param values - Array di nomi o ID di workout goals
 * @returns Array di ID di workout goals
 */
export declare function convertWorkoutGoalNamesToIds(values: string[]): Promise<string[]>;
/**
 * Get all metadata for a locale (for dropdown/selector components)
 */
export declare function getAllMetadataForLocale(locale?: string): Promise<{
    exerciseTypes: never[] | {
        id: string;
        name: string;
        slug: undefined;
        imageUrl: string | null;
        localizedName: string;
        translations: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            exerciseTypeId: string;
            locale: string;
        }[];
    }[];
    muscles: never[] | {
        id: string;
        name: string;
        slug: string;
        imageUrl: string | null;
        localizedName: string;
        translations: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            locale: string;
            muscleId: string;
        }[];
    }[];
    bodyParts: never[] | {
        id: string;
        name: string;
        slug: string;
        imageUrl: string | null;
        localizedName: string;
        translations: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            locale: string;
            bodyPartId: string;
        }[];
    }[];
    equipment: never[] | {
        id: string;
        name: string;
        slug: string;
        imageUrl: string | null;
        localizedName: string;
        translations: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            locale: string;
            equipmentId: string;
        }[];
    }[];
    workoutGoals: never[] | {
        id: string;
        name: string;
        slug: string;
        localizedName: string;
        translations: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            locale: string;
            workoutGoalId: string;
        }[];
    }[];
}>;
//# sourceMappingURL=metadata-translation.service.d.ts.map