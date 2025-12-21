/**
 * Meal Template Service
 *
 * Servizio per gestione template pasti (meals) salvabili e riutilizzabili
 * Segue pattern FoodService per consistenza
 */
import type { MealTemplate, Meal } from '@onecoach/types';
export declare class MealTemplateService {
    /**
     * Crea nuovo template pasto
     */
    static createTemplate(userId: string, data: {
        name: string;
        description?: string;
        meal: Meal;
        tags?: string[];
        isPublic?: boolean;
    }): Promise<MealTemplate>;
    /**
     * Lista template dell'utente
     */
    static listTemplates(userId: string, options?: {
        search?: string;
        tags?: string[];
        limit?: number;
        offset?: number;
    }): Promise<MealTemplate[]>;
    /**
     * Recupera template per ID
     */
    static getTemplateById(id: string, userId: string): Promise<MealTemplate | null>;
    /**
     * Aggiorna template
     */
    static updateTemplate(id: string, userId: string, data: {
        name?: string;
        description?: string;
        meal?: Meal;
        tags?: string[];
        isPublic?: boolean;
    }): Promise<MealTemplate>;
    /**
     * Elimina template
     */
    static deleteTemplate(id: string, userId: string): Promise<void>;
    /**
     * Mappa da Prisma model a MealTemplate
     */
    private static mapToMealTemplate;
}
