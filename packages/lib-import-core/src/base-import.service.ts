/**
 * Base Import Service
 *
 * Abstract base class for domain-specific import services.
 * Implements the Template Method pattern for the import workflow.
 *
 * @module lib-import-core/base-import.service
 */

import { logger as baseLogger } from '@onecoach/lib-shared/utils/logger';
import type {
    ImportFile,
    ImportOptions,
    ImportProgress,
    ImportProgressStep,
    AIParseContext,
} from './types';
import { IMPORT_LIMITS } from './types';
import { createMimeRouter } from './mime-router';

// ==================== TYPES ====================

/**
 * Import context for request tracking
 */
export interface ImportContext {
    /** Unique request identifier */
    requestId: string;
    /** User performing the import */
    userId: string;
}

/**
 * Base result shape that all domain results must extend
 */
export interface BaseImportResult {
    success: boolean;
    errors?: string[];
    warnings?: string[];
}

/**
 * Configuration for import services
 */
export interface ImportServiceConfig<TParsed> {
    /** AI context for parsing files */
    aiContext: AIParseContext<TParsed>;
    /** Optional progress callback */
    onProgress?: (progress: ImportProgress) => void;
    /** Request context for logging */
    context: ImportContext;
}

// ==================== ABSTRACT BASE CLASS ====================

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
export abstract class BaseImportService<TParsed, TResult extends BaseImportResult> {
    protected readonly aiContext: AIParseContext<TParsed>;
    protected readonly onProgress?: (progress: ImportProgress) => void;
    protected readonly context: ImportContext;
    protected readonly logger;

    constructor(config: ImportServiceConfig<TParsed>) {
        this.aiContext = config.aiContext;
        this.onProgress = config.onProgress;
        this.context = config.context;
        this.logger = baseLogger.child(this.getLoggerName());
    }

    // ==================== TEMPLATE METHOD ====================

    /**
     * Main import workflow (Template Method)
     *
     * Steps:
     * 1. Validate files (shared)
     * 2. Parse with AI (shared routing, domain prompt)
     * 3. Process parsed data (domain-specific)
     * 4. Persist to database (domain-specific)
     */
    async import(
        files: ImportFile[],
        userId: string,
        options?: Partial<ImportOptions>
    ): Promise<TResult> {
        const warnings: string[] = [];
        const errors: string[] = [];

        try {
            // Step 1: Validation
            this.emit({
                step: 'validating',
                message: 'Validazione file in corso...',
                progress: 0,
            });
            this.validateFiles(files);

            // Step 2: Parsing
            this.emit({
                step: 'parsing',
                message: 'Parsing con AI...',
                progress: 0.25,
            });
            const parsed = await this.parseFiles(files, options);

            // Step 3: Domain-specific processing
            this.emit({
                step: 'matching',
                message: 'Elaborazione dati...',
                progress: 0.5,
            });
            const processed = await this.processParsed(parsed, userId, options);

            // Step 4: Persistence
            this.emit({
                step: 'persisting',
                message: 'Salvataggio...',
                progress: 0.75,
            });
            const result = await this.persist(processed, userId);

            // Complete
            this.emit({
                step: 'completed',
                message: 'Import completato',
                progress: 1,
            });

            return { ...result, success: true, warnings } as TResult;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Errore sconosciuto';
            this.logger.error('Import failed', {
                requestId: this.context.requestId,
                userId,
                error: message,
            });
            errors.push(message);

            this.emit({
                step: 'error',
                message: `Errore: ${message}`,
                progress: 0,
            });

            return this.createErrorResult(errors) as TResult;
        }
    }

    // ==================== SHARED IMPLEMENTATIONS ====================

    /**
     * Emit progress update
     */
    protected emit(progress: Partial<ImportProgress> & { step: ImportProgressStep; message: string }): void {
        if (this.onProgress) {
            this.onProgress({
                step: progress.step,
                message: progress.message,
                progress: progress.progress,
                stepNumber: progress.stepNumber,
                totalSteps: progress.totalSteps,
                metadata: progress.metadata,
            });
        }
    }

    /**
     * Validate files against common limits
     */
    protected validateFiles(files: ImportFile[]): void {
        if (!files || files.length === 0) {
            throw new Error('Almeno un file richiesto');
        }

        if (files.length > IMPORT_LIMITS.MAX_FILES) {
            throw new Error(`Massimo ${IMPORT_LIMITS.MAX_FILES} file consentiti`);
        }

        for (const file of files) {
            if (file.size && file.size > IMPORT_LIMITS.MAX_FILE_SIZE) {
                const maxMB = Math.round(IMPORT_LIMITS.MAX_FILE_SIZE / (1024 * 1024));
                throw new Error(`File troppo grande: ${file.name} (max ${maxMB}MB)`);
            }
        }
    }

    /**
     * Parse files using AI with MIME routing
     */
    protected async parseFiles(
        files: ImportFile[],
        options?: Partial<ImportOptions>
    ): Promise<TParsed> {
        const prompt = this.buildPrompt(options);

        // Create unified handler that uses AI context
        const handler = async (content: string, mimeType: string): Promise<TParsed> => {
            return this.aiContext.parseWithAI(content, mimeType, prompt);
        };

        // Build MIME router
        const router = createMimeRouter<TParsed>({
            image: handler,
            pdf: handler,
            spreadsheet: handler,
            document: handler,
            fallback: handler,
        });

        // Parse first file (multi-file support can be added per-domain)
        const file = files[0];
        if (!file) {
            throw new Error('Nessun file valido fornito');
        }

        return router(file.content, file.mimeType || 'application/octet-stream');
    }

    // ==================== ABSTRACT METHODS (Domain-specific) ====================

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
    protected abstract processParsed(
        parsed: TParsed,
        userId: string,
        options?: Partial<ImportOptions>
    ): Promise<unknown>;

    /**
     * Persist processed data to database
     *
     * @param processed - Processed data from processParsed
     * @param userId - User ID
     * @returns Partial result with domain-specific IDs/data
     */
    protected abstract persist(
        processed: unknown,
        userId: string
    ): Promise<Partial<TResult>>;

    /**
     * Create error result with domain-specific shape
     */
    protected abstract createErrorResult(errors: string[]): Partial<TResult>;
}
