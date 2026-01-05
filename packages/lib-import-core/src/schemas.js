/**
 * Shared Import Schemas
 *
 * Zod schemas for import tooling.
 *
 * @module lib-import-core/schemas
 */
import { z } from 'zod';
export const ImportFileSchema = z.object({
    name: z.string(),
    mimeType: z.string().optional(),
    content: z.string().describe('File content in base64'),
    size: z.number().optional(),
    sheetIndex: z.number().optional(),
    sheetName: z.string().optional(),
});
export const ImportOptionsSchema = z.object({
    mode: z.enum(['auto', 'review']).default('auto'),
    locale: z.string().default('it-IT'),
    matchThreshold: z.number().min(0).max(1).default(0.8),
    preserveProgressions: z.boolean().default(true),
});
