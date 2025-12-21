/**
 * Base Import Service
 *
 * Abstract base class for domain-specific import services.
 * Implements the Template Method pattern for the import workflow.
 *
 * @module lib-import-core/base-import.service
 */
import type { ImportFile, ImportOptions, ImportProgress, ImportProgressStep, AIParseContext, ImportContext, BaseImportResult, ImportServiceConfig } from './types';
/**
 * Abstract base class for domain-specific import services.
 *
 * Implements the Template Method pattern:
 * - Shared logic: validation, parsing orchestration, progress emission
 * - Abstract methods: domain-specific prompt, processing, persistence
 *
 * @template TParsed - The parsed AI output type
 * @template TResult - The final import result type
 *
 * @example
 * ```typescript
 * class NutritionImportService extends BaseImportService<ImportedNutritionPlan, NutritionImportResult> {
 *   protected buildPrompt(): string { ... }
 *   protected async processParsed(parsed, userId): Promise<ProcessedPlan> { ... }
 *   protected async persist(processed, userId): Promise<Partial<NutritionImportResult>> { ... }
 *   protected createErrorResult(errors): Partial<NutritionImportResult> { ... }
 * }
 * ```
 */
export declare abstract class BaseImportService<TParsed, TResult extends BaseImportResult> {
    protected readonly aiContext: AIParseContext<TParsed>;
    protected readonly onProgress?: (progress: ImportProgress) => void;
    protected readonly context: ImportContext;
    protected readonly logger: import("@onecoach/lib-shared").Logger;
    constructor(config: ImportServiceConfig<TParsed>);
    /**
     * Main import workflow (Template Method)
     *
     * Steps:
     * 1. Validate files (shared)
     * 2. Parse with AI (shared routing, domain prompt)
     * 3. Process parsed data (domain-specific)
     * 4. Persist to database (domain-specific)
     */
    import(files: ImportFile[], userId: string, options?: Partial<ImportOptions>): Promise<TResult>;
    /**
     * Emit progress update
     */
    protected emit(progress: Partial<ImportProgress> & {
        step: ImportProgressStep;
        message: string;
    }): void;
    /**
     * Validate files against common limits
     */
    protected validateFiles(files: ImportFile[]): void;
    /**
     * Parse files using AI with MIME routing
     */
    protected parseFiles(files: ImportFile[], options?: Partial<ImportOptions>): Promise<TParsed>;
    /**
     * Get logger name for this domain
     */
    protected abstract getLoggerName(): string;
    /**
     * Build the AI prompt for this domain
     */
    protected abstract buildPrompt(options?: Partial<ImportOptions>): string;
    /**
     * Process parsed data (matching, normalization, transformation)
     *
     * @param parsed - Raw AI output
     * @param userId - User ID
     * @param options - Import options
     * @returns Processed data ready for persistence
     */
    protected abstract processParsed(parsed: TParsed, userId: string, options?: Partial<ImportOptions>): Promise<unknown>;
    /**
     * Persist processed data to database
     *
     * @param processed - Processed data from processParsed
     * @param userId - User ID
     * @returns Partial result with domain-specific IDs/data
     */
    protected abstract persist(processed: unknown, userId: string): Promise<Partial<TResult>>;
    /**
     * Create error result with domain-specific shape
     */
    protected abstract createErrorResult(errors: string[]): Partial<TResult>;
}
