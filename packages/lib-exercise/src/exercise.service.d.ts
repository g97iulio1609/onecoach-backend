import type { CreateExerciseInput, ExerciseQueryParams, UpdateExerciseInput } from '@onecoach/schemas/exercise.schema';
import { ExerciseApprovalStatus } from '@prisma/client';
import type { LocalizedExercise } from '@onecoach/types';
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