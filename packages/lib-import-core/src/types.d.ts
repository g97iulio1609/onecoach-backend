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
export type AIParseContext<TParsed = unknown> = {
    parseWithAI: (content: string, mimeType: string, prompt: string) => Promise<TParsed>;
};
export type MimeHandler<TParsed> = (content: string, mimeType: string) => Promise<TParsed>;
export type MimeRouterHandlers<TParsed> = {
    image?: MimeHandler<TParsed>;
    pdf?: MimeHandler<TParsed>;
    spreadsheet?: MimeHandler<TParsed>;
    document?: MimeHandler<TParsed>;
    fallback?: MimeHandler<TParsed>;
};
export type VisionParseParams<T> = {
    contentBase64: string;
    mimeType: string;
    prompt: string;
    schema: z.ZodSchema<T>;
    modelId?: string;
    apiKey?: string;
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
 */
export interface ImportServiceConfig<TParsed> {
    /** AI context for parsing files */
    aiContext: AIParseContext<TParsed>;
    /** Optional progress callback */
    onProgress?: (progress: ImportProgress) => void;
    /** Request context for logging */
    context: ImportContext;
}
//# sourceMappingURL=types.d.ts.map