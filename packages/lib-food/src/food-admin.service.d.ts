/**
 * Food Admin Service
 *
 * Utility dedicate alla gestione avanzata del catalogo alimenti:
 * - Import/export in formato JSON con deduplica
 * - Operazioni batch (CRUD) e automazioni AI
 */
import { z } from 'zod';
export declare const foodImportSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    macrosPer100g: z.ZodObject<{
        calories: z.ZodNumber;
        protein: z.ZodNumber;
        carbs: z.ZodNumber;
        fats: z.ZodNumber;
        fiber: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    servingSize: z.ZodNumber;
    unit: z.ZodDefault<z.ZodString>;
    barcode: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    imageUrl: z.ZodOptional<z.ZodURL>;
    brandId: z.ZodOptional<z.ZodString>;
    brandName: z.ZodOptional<z.ZodString>;
    categoryIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    mainMacro: z.ZodOptional<z.ZodType<import("@onecoach/types").MainMacro, unknown, z.core.$ZodTypeInternals<import("@onecoach/types").MainMacro, unknown>>>;
    translations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        locale: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type FoodImportPayload = z.infer<typeof foodImportSchema>;
export interface FoodImportResult {
    created: number;
    updated: number;
    skipped: number;
    createdItems: Array<{
        id: string;
        name: string;
    }>;
    updatedItems: Array<{
        id: string;
        name: string;
    }>;
    skippedNames: string[];
    errors: Array<{
        name: string;
        reason: string;
    }>;
}
interface ImportOptions {
    userId?: string;
    mergeExisting?: boolean;
    onProgress?: (current: number, total: number) => void;
}
export declare class FoodAdminService {
    /**
     * Genera alimenti usando FoodGenerationAgent (OneAgent SDK)
     * Usa parallel batch processing per migliori performance
     */
    static generateFoodsWithAgent(options: {
        count: number;
        description?: string;
        existingFoods?: string[];
        categoryIds?: string[];
        userId?: string;
        mergeExisting?: boolean;
        onProgress?: (progress: number, message: string) => void;
    }): Promise<FoodImportResult>;
    /**
     * Importa alimenti nel database con deduplica e merge
     */
    static import(records: FoodImportPayload[], options?: ImportOptions): Promise<FoodImportResult>;
    /**
     * Normalizza payload di import generando campi coerenti
     */
    private static normalizeImportRecord;
}
export {};
//# sourceMappingURL=food-admin.service.d.ts.map