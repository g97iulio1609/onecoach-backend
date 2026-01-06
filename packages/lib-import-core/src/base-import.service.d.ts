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
 * @template TAIRaw - The raw type returned by AI parsing (what parseWithAI returns)
 * @template TParsed - The internal parsed/wrapped data type after processing (defaults to TAIRaw)
 * @template TResult - The final import result type
 *
 * For most services, TAIRaw and TParsed are the same type. Use different types only when
 * you need to wrap the raw AI output in a richer structure (e.g., adding warnings/stats).
 *
 * @example
 * ```typescript
 * // Simple case: TAIRaw = TParsed
 * class NutritionImportService extends BaseImportService<ImportedNutritionPlan, ImportedNutritionPlan, NutritionImportResult> {
 *   // processParsed receives ImportedNutritionPlan, returns ImportedNutritionPlan
 * }
 *
 * // Advanced case: TAIRaw !== TParsed
 * class WorkoutImportService extends BaseImportService<ImportedWorkoutProgram, ParsedWorkoutData, WorkoutImportResult> {
 *   // processParsed receives ImportedWorkoutProgram, returns ParsedWorkoutData
 * }
 * ```
 */
export declare abstract class BaseImportService<TAIRaw extends object, TParsed extends object = TAIRaw, TResult extends BaseImportResult = BaseImportResult> {
    protected readonly aiContext: AIParseContext<TAIRaw>;
    protected readonly onProgress?: (progress: ImportProgress) => void;
    protected readonly context: ImportContext;
    protected readonly logger: import("@onecoach/lib-shared").Logger;
    constructor(config: ImportServiceConfig<TAIRaw>);
    /**
     * Main import workflow (Template Method)
     *
     * Steps:
     * 1. Validate files (shared)
     * 2. Parse with AI (shared routing, domain prompt) -> TAIRaw
     * 3. Process parsed data (domain-specific) -> TParsed
     * 4. Persist to database (domain-specific)
     */
    import(files: ImportFile[], userId: string, options?: Partial<ImportOptions>): Promise<TResult>;
    /** Get logger name for this service */
    protected abstract getLoggerName(): string;
    /** Build the AI prompt for parsing */
    protected abstract buildPrompt(options?: Partial<ImportOptions>): string;
    /**
     * Process the raw parsed AI data (domain-specific transformations)
     * Transforms TAIRaw -> TParsed
     */
    protected abstract processParsed(parsed: TAIRaw, userId: string, options?: Partial<ImportOptions>): Promise<TParsed>;
    /**
     * Persist the processed data to database
     */
    protected abstract persist(processed: TParsed, userId: string): Promise<Partial<TResult>>;
    /**
     * Create an error result for failures
     */
    protected abstract createErrorResult(errors: string[]): Partial<TResult>;
    /**
     * Validate files before processing
     */
    protected validateFiles(files: ImportFile[]): void;
    /**
     * Parse files using AI with MIME routing
     * @returns TAIRaw - the raw AI output
     */
    protected parseFiles(files: ImportFile[], userId: string, options?: Partial<ImportOptions>): Promise<TAIRaw>;
    /**
     * Emit progress update
     */
    protected emit(progress: {
        step: ImportProgressStep;
        message: string;
        progress: number;
    }): void;
}
//# sourceMappingURL=base-import.service.d.ts.map