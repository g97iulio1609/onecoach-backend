/**
 * Shared Import Schemas
 *
 * Zod schemas for import tooling.
 *
 * @module lib-import-core/schemas
 */
import { z } from 'zod';
export declare const ImportFileSchema: z.ZodObject<{
    name: z.ZodString;
    mimeType: z.ZodOptional<z.ZodString>;
    content: z.ZodString;
    size: z.ZodOptional<z.ZodNumber>;
    sheetIndex: z.ZodOptional<z.ZodNumber>;
    sheetName: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ImportOptionsSchema: z.ZodObject<{
    mode: z.ZodDefault<z.ZodEnum<{
        auto: "auto";
        review: "review";
    }>>;
    locale: z.ZodDefault<z.ZodString>;
    matchThreshold: z.ZodDefault<z.ZodNumber>;
    preserveProgressions: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
//# sourceMappingURL=schemas.d.ts.map