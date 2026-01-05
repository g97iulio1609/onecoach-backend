import { z } from 'zod';
import type { AIParseContext, ImportOptions, BaseImportResult } from '@onecoach/lib-import-core';
import { BaseImportService } from '@onecoach/lib-import-core';
import type { nutrition_plans } from '@prisma/client';
import type { ImportedNutritionPlan } from './helpers/imported-nutrition.schema';
declare const NutritionImportOptionsSchema: z.ZodObject<{
    mode: z.ZodDefault<z.ZodEnum<{
        auto: "auto";
        review: "review";
    }>>;
    locale: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type NutritionImportOptions = z.infer<typeof NutritionImportOptionsSchema>;
/**
 * Result of the nutrition import process
 */
export interface NutritionImportResult extends BaseImportResult {
    planId?: string;
    plan?: nutrition_plans;
    parseResult?: ImportedNutritionPlan;
}
/**
 * Service for importing nutrition plans.
 * Extends BaseImportService to use shared orchestration logic.
 */
export declare class NutritionImportService extends BaseImportService<ImportedNutritionPlan, NutritionImportResult> {
    protected getLoggerName(): string;
    protected buildPrompt(_options?: Partial<ImportOptions>): string;
    protected processParsed(parsed: ImportedNutritionPlan, userId: string, options?: Partial<ImportOptions>): Promise<unknown>;
    protected persist(processed: unknown, userId: string): Promise<Partial<NutritionImportResult>>;
    protected createErrorResult(errors: string[]): Partial<NutritionImportResult>;
}
export declare function createNutritionAIContext(): AIParseContext<ImportedNutritionPlan>;
export {};
//# sourceMappingURL=nutrition-import.service.d.ts.map