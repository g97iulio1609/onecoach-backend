import { z } from 'zod';
export type ImportMode = 'auto' | 'review';
export type ImportFile = {
    name: string;
    mimeType?: string;
    content: string;
    size?: number;
    sheetIndex?: number;
    sheetName?: string;
};
export type ImportOptions = {
    mode?: ImportMode;
    locale?: string;
    matchThreshold?: number;
    preserveProgressions?: boolean;
};
export type ImportProgressStep = 'validating' | 'parsing' | 'matching' | 'persisting' | 'completed' | 'error';
export type ImportProgress = {
    step: ImportProgressStep;
    message: string;
    progress?: number;
    stepNumber?: number;
    totalSteps?: number;
    metadata?: Record<string, unknown>;
};
/**
 * AI Parse Context interface for domain-specific AI parsing.
 * @template TParsed - The parsed output type (must be an object to support spread)
 */
export type AIParseContext<TParsed extends object = Record<string, unknown>> = {
    parseWithAI: (content: string, mimeType: string, prompt: string, userId?: string) => Promise<TParsed>;
};
export type MimeHandler<TParsed> = (content: string, mimeType: string) => Promise<TParsed>;
export type MimeRouterHandlers<TParsed> = {
    image?: MimeHandler<TParsed>;
    pdf?: MimeHandler<TParsed>;
    spreadsheet?: MimeHandler<TParsed>;
    document?: MimeHandler<TParsed>;
    fallback?: MimeHandler<TParsed>;
};
export type ImportFileType = 'image' | 'pdf' | 'document' | 'spreadsheet';
export type VisionParseParams<T> = {
    contentBase64: string;
    mimeType: string;
    prompt: string;
    schema: z.ZodSchema<T>;
    /** User ID for credit handling */
    userId: string;
    /** File type for model selection and credit cost */
    fileType: ImportFileType;
    /** Override model ID (optional, uses config if not provided) */
    modelId?: string;
    /** Override API key (optional, uses config if not provided) */
    apiKey?: string;
    /** Custom credit cost (optional, uses config if not provided) */
    creditCost?: number;
    /** Progress callback for streaming updates */
    onProgress?: (message: string, progress: number) => void;
};
export declare const IMPORT_LIMITS: {
    MAX_FILES: number;
    MAX_FILE_SIZE: number;
    RATE_LIMIT_PER_HOUR: number;
    DEFAULT_CREDIT_COST: number;
};
export declare const SUPPORTED_MIME_TYPES: string[];
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
 * @template TAIRaw - The raw type returned by AI parsing (must be an object)
 */
export interface ImportServiceConfig<TAIRaw extends object> {
    /** AI context for parsing files */
    aiContext: AIParseContext<TAIRaw>;
    /** Optional progress callback */
    onProgress?: (progress: ImportProgress) => void;
    /** Request context for logging */
    context: ImportContext;
}
//# sourceMappingURL=types.d.ts.map