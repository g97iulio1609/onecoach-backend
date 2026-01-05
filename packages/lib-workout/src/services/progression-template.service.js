import { prisma } from '@onecoach/lib-core/prisma';
const PROGRESSION_TEMPLATE_TYPE = 'week';
export class ProgressionTemplateService {
    /**
     * Create a new progression template
     */
    static async create(userId, data) {
        const { name, description, ...params } = data;
        return prisma.workout_templates.create({
            data: {
                userId,
                name,
                description,
                type: PROGRESSION_TEMPLATE_TYPE,
                data: params, // Store params as JSON
                category: 'progression',
                isPublic: false, // Private by default
            },
        });
    }
    /**
     * List progression templates for a user
     */
    static async list(userId) {
        const templates = await prisma.workout_templates.findMany({
            where: {
                userId,
                type: PROGRESSION_TEMPLATE_TYPE,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return templates.map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            params: t.data,
        }));
    }
    /**
     * Delete a progression template
     */
    static async delete(userId, templateId) {
        return prisma.workout_templates.delete({
            where: {
                id: templateId,
                userId, // Ensure ownership
            },
        });
    }
    /**
     * Get a specific template
     */
    static async get(userId, templateId) {
        const template = await prisma.workout_templates.findUnique({
            where: {
                id: templateId,
                userId,
            },
        });
        if (!template)
            return null;
        return {
            id: template.id,
            name: template.name,
            description: template.description,
            params: template.data,
        };
    }
}
