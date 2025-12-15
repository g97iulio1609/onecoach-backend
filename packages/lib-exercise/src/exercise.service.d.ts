import type { CreateExerciseInput, ExerciseQueryParams, UpdateExerciseInput } from '@onecoach/schemas/exercise.schema';
import { ExerciseApprovalStatus, ExerciseRelationType, MuscleRole } from '@prisma/client';
export interface ExerciseTranslationView {
    locale: string;
    name: string;
    shortName?: string | null;
    description?: string | null;
    searchTerms: string[];
}
export interface LocalizedExercise {
    id: string;
    slug: string;
    name: string;
    exerciseTypeId: string | null;
    exerciseTypeName: string | null;
    overview: string | null;
    imageUrl: string | null;
    videoUrl: string | null;
    keywords: string[];
    instructions: string[];
    exerciseTips: string[];
    variations: string[];
    approvalStatus: ExerciseApprovalStatus;
    approvedAt: Date | null;
    isUserGenerated: boolean;
    version: number;
    locale: string;
    translation: ExerciseTranslationView | null;
    fallbackLocale: string | null;
    translations?: ExerciseTranslationView[];
    muscles: Array<{
        id: string;
        name: string;
        slug: string;
        role: MuscleRole;
    }>;
    bodyParts: Array<{
        id: string;
        name: string;
        slug: string;
    }>;
    equipments: Array<{
        id: string;
        name: string;
        slug: string;
    }>;
    related: Array<{
        id: string;
        slug: string;
        relation: ExerciseRelationType;
        direction: 'inbound' | 'outbound';
    }>;
}
import type { ExercisesResponse } from '@onecoach/lib-api';
type ExerciseListResult = Omit<ExercisesResponse, 'data'> & {
    data: LocalizedExercise[];
    page: number;
    pageSize: number;
    total: number;
};
export declare class ExerciseService {
    static list(options: ExerciseQueryParams & {
        includeTranslations?: boolean;
    }): Promise<ExerciseListResult>;
    static search(term: string, options: Omit<ExerciseQueryParams, 'search'>): Promise<LocalizedExercise[]>;
    static getById(id: string, locale?: string, options?: {
        includeTranslations?: boolean;
        includeUnapproved?: boolean;
    }): Promise<LocalizedExercise | null>;
    static getBySlug(slug: string, locale?: string, options?: {
        includeTranslations?: boolean;
        includeUnapproved?: boolean;
    }): Promise<LocalizedExercise | null>;
    static create(payload: CreateExerciseInput, options?: {
        userId?: string;
        autoApprove?: boolean;
    }): Promise<LocalizedExercise>;
    static update(id: string, payload: UpdateExerciseInput, options?: {
        userId?: string;
        locale?: string;
        includeTranslations?: boolean;
    }): Promise<LocalizedExercise>;
    static setApprovalStatus(id: string, status: ExerciseApprovalStatus, options: {
        userId: string;
    }): Promise<LocalizedExercise>;
    static delete(id: string): Promise<{
        id: string;
        slug: string;
    }>;
    static deleteMany(ids: string[]): Promise<{
        deleted: number;
    }>;
    private static sanitizeListOptions;
    private static normalizeLocale;
    private static buildExerciseCacheKey;
    private static buildListCacheKey;
    private static sanitizeArray;
    private static pickTranslation;
    private static mapExerciseToLocalized;
    private static mapListRowToLocalized;
    private static buildSnapshot;
    private static recordVersion;
    private static invalidateCaches;
    private static buildWhereClause;
    private static countSearchFullText;
    private static searchFullText;
    private static getSearchConditions;
    private static prepareCreateData;
    private static prepareUpdateData;
    private static normalizeTranslationInput;
    private static prepareRelatedRelations;
}
export declare const exerciseService: typeof ExerciseService;
export {};
//# sourceMappingURL=exercise.service.d.ts.map