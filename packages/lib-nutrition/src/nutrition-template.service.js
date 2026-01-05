/**
 * Nutrition Template Service
 *
 * Servizio unificato per gestione template nutrizionali (Meal, Day, Week)
 * Segue principi SOLID: Single Responsibility, Open/Closed, DRY
 */
import { prisma } from '@onecoach/lib-core/prisma';
import { Prisma } from '@prisma/client';
import { createId } from '@onecoach/lib-shared/id-generator';
import { logger } from '@onecoach/lib-core';
/**
 * Validazione template data in base al tipo
 */
function validateTemplateData(type, data) {
    switch (type) {
        case 'meal':
            const meal = data;
            if (!meal.foods || meal.foods.length === 0) {
                throw new Error('Il pasto deve contenere almeno un alimento');
            }
            break;
        case 'day':
            const day = data;
            if (!day.meals || day.meals.length === 0) {
                throw new Error('Il giorno deve contenere almeno un pasto');
            }
            break;
        case 'week':
            const week = data;
            if (!week.days || week.days.length === 0) {
                throw new Error('La settimana deve contenere almeno un giorno');
            }
            break;
        default:
            throw new Error(`Tipo template non valido: ${type}`);
    }
}
export class NutritionTemplateService {
    /**
     * Crea nuovo template
     */
    static async createTemplate(userId, data) {
        // Validazione nome
        if (!data.name || data.name.trim().length === 0) {
            throw new Error('Il nome del template è obbligatorio');
        }
        // Validazione tipo
        if (!['meal', 'day', 'week'].includes(data.type)) {
            throw new Error("Il tipo deve essere 'meal', 'day' o 'week'");
        }
        // Validazione data
        validateTemplateData(data.type, data.data);
        // Validazione tags (max 10)
        if (data.tags && data.tags.length > 10) {
            throw new Error('Massimo 10 tags consentiti');
        }
        const template = await prisma.nutrition_templates.create({
            data: {
                id: createId('nutrition_template'),
                userId,
                type: data.type,
                name: data.name.trim(),
                description: data.description?.trim() || null,
                category: data.category?.trim() || null,
                tags: data.tags || [],
                data: data.data,
                isPublic: data.isPublic || false,
                usageCount: 0,
                lastUsedAt: null,
            },
        });
        return this.mapToNutritionTemplate(template);
    }
    /**
     * Lista template con filtri avanzati
     */
    static async listTemplates(userId, options = {}) {
        const logPrefix = '[NutritionTemplateService] listTemplates error';
        const where = {
            userId,
        };
        // Filtro tipo
        if (options.type) {
            where.type = options.type;
        }
        // Filtro categoria
        if (options.category) {
            where.category = options.category;
        }
        // Filtro tags (almeno uno deve matchare)
        if (options.tags && options.tags.length > 0) {
            where.tags = {
                hasSome: options.tags,
            };
        }
        // Ricerca su nome/descrizione
        if (options.search && options.search.length >= 2) {
            where.OR = [
                { name: { contains: options.search, mode: 'insensitive' } },
                { description: { contains: options.search, mode: 'insensitive' } },
                { tags: { has: options.search } },
            ];
        }
        // Ordinamento
        let orderBy;
        const sortBy = options.sortBy || 'lastUsedAt';
        const sortOrder = options.sortOrder || 'desc';
        switch (sortBy) {
            case 'createdAt':
                orderBy = { createdAt: sortOrder };
                break;
            case 'lastUsedAt':
                // Usare ordinamento singolo, Prisma gestisce null automaticamente
                // Per desc: null vengono alla fine, per asc: null vengono all'inizio
                orderBy = { lastUsedAt: sortOrder };
                break;
            case 'usageCount':
                orderBy = [{ usageCount: sortOrder }, { createdAt: 'desc' }];
                break;
            case 'name':
                orderBy = [{ name: sortOrder }, { createdAt: 'desc' }];
                break;
            default:
                // Default: ordina per createdAt
                orderBy = { createdAt: 'desc' };
        }
        try {
            const templates = await prisma.nutrition_templates.findMany({
                where,
                orderBy,
                take: options.limit || 50,
                skip: options.offset || 0,
            });
            return templates.map((t) => this.mapToNutritionTemplate(t));
        }
        catch (error) {
            logger.error(logPrefix, error);
            logger.error('[NutritionTemplateService] where clause:', JSON.stringify(where, null, 2));
            logger.error('[NutritionTemplateService] orderBy:', JSON.stringify(orderBy, null, 2));
            logger.error('[NutritionTemplateService] options:', JSON.stringify(options, null, 2));
            throw error;
        }
    }
    /**
     * Recupera template per ID
     */
    static async getTemplateById(id, userId) {
        const template = await prisma.nutrition_templates.findFirst({
            where: {
                id,
                OR: [{ userId }, { isPublic: true }],
            },
        });
        if (!template)
            return null;
        return this.mapToNutritionTemplate(template);
    }
    /**
     * Aggiorna template
     */
    static async updateTemplate(id, userId, data) {
        // Verifica esistenza e proprietà
        const existing = await prisma.nutrition_templates.findFirst({
            where: { id, userId },
        });
        if (!existing) {
            throw new Error('Template non trovato o non autorizzato');
        }
        // Validazione data se fornita
        if (data.data) {
            validateTemplateData(existing.type, data.data);
        }
        // Validazione tags
        if (data.tags && data.tags.length > 10) {
            throw new Error('Massimo 10 tags consentiti');
        }
        const updateData = {};
        if (data.name !== undefined) {
            updateData.name = data.name.trim();
        }
        if (data.description !== undefined) {
            updateData.description = data.description?.trim() || null;
        }
        if (data.category !== undefined) {
            updateData.category = data.category?.trim() || null;
        }
        if (data.tags !== undefined) {
            updateData.tags = data.tags;
        }
        if (data.data !== undefined) {
            updateData.data = data.data;
        }
        if (data.isPublic !== undefined) {
            updateData.isPublic = data.isPublic;
        }
        const updated = await prisma.nutrition_templates.update({
            where: { id },
            data: updateData,
        });
        return this.mapToNutritionTemplate(updated);
    }
    /**
     * Elimina template
     */
    static async deleteTemplate(id, userId) {
        const existing = await prisma.nutrition_templates.findFirst({
            where: { id, userId },
        });
        if (!existing) {
            throw new Error('Template non trovato o non autorizzato');
        }
        await prisma.nutrition_templates.delete({
            where: { id },
        });
    }
    /**
     * Incrementa contatore utilizzi
     */
    static async incrementUsage(id) {
        await prisma.nutrition_templates.update({
            where: { id },
            data: {
                usageCount: { increment: 1 },
                lastUsedAt: new Date(),
            },
        });
    }
    /**
     * Mappa da Prisma model a NutritionTemplate
     */
    static mapToNutritionTemplate(template) {
        const logPrefix = '[NutritionTemplateService] mapToNutritionTemplate';
        try {
            return {
                id: template.id,
                type: template.type,
                name: template.name,
                description: template.description || undefined,
                category: template.category || undefined,
                tags: template.tags || [],
                data: template.data,
                isPublic: template.isPublic,
                usageCount: template.usageCount,
                lastUsedAt: template.lastUsedAt?.toISOString() || undefined,
                userId: template.userId ?? '',
                createdAt: template.createdAt.toISOString(),
                updatedAt: template.updatedAt.toISOString(),
            };
        }
        catch (error) {
            logger.error(logPrefix, error);
            logger.error('[NutritionTemplateService] template data:', JSON.stringify(template, null, 2));
            throw error;
        }
    }
}
