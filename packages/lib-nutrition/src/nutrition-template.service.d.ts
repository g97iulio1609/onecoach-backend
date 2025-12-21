/**
 * Nutrition Template Service
 *
 * Servizio unificato per gestione template nutrizionali (Meal, Day, Week)
 * Segue principi SOLID: Single Responsibility, Open/Closed, DRY
 */
import type { NutritionTemplate, NutritionTemplateType, Meal, NutritionDay, NutritionWeek } from '@onecoach/types';
interface ListTemplatesOptions {
    type?: NutritionTemplateType;
    category?: string;
    tags?: string[];
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'createdAt' | 'lastUsedAt' | 'usageCount' | 'name';
    sortOrder?: 'asc' | 'desc';
}
export declare class NutritionTemplateService {
    /**
     * Crea nuovo template
     */
    static createTemplate(userId: string, data: {
        type: NutritionTemplateType;
        name: string;
        description?: string;
        category?: string;
        tags?: string[];
        data: Meal | NutritionDay | NutritionWeek;
        isPublic?: boolean;
    }): Promise<NutritionTemplate>;
    /**
     * Lista template con filtri avanzati
     */
    static listTemplates(userId: string, options?: ListTemplatesOptions): Promise<NutritionTemplate[]>;
    /**
     * Recupera template per ID
     */
    static getTemplateById(id: string, userId: string): Promise<NutritionTemplate | null>;
    /**
     * Aggiorna template
     */
    static updateTemplate(id: string, userId: string, data: {
        name?: string;
        description?: string;
        category?: string;
        tags?: string[];
        data?: Meal | NutritionDay | NutritionWeek;
        isPublic?: boolean;
    }): Promise<NutritionTemplate>;
    /**
     * Elimina template
     */
    static deleteTemplate(id: string, userId: string): Promise<void>;
    /**
     * Incrementa contatore utilizzi
     */
    static incrementUsage(id: string): Promise<void>;
    /**
     * Mappa da Prisma model a NutritionTemplate
     */
    private static mapToNutritionTemplate;
}
export {};
