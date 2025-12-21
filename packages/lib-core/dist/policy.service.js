/**
 * Policy Service
 *
 * Gestione delle policy pages (Privacy, Terms, GDPR, Content Policy)
 */
import { prisma } from './prisma';
import { PolicyStatus, PolicyType, Prisma } from '@prisma/client';
/**
 * Policy Service
 */
export class PolicyService {
    /**
     * Ottiene tutte le policy
     */
    static async getAllPolicies(includeCreator = false) {
        return (await prisma.policies.findMany({
            include: includeCreator
                ? {
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    updatedBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                }
                : undefined,
            orderBy: { createdAt: 'desc' },
        }));
    }
    /**
     * Ottiene le policy pubblicate
     */
    static async getPublishedPolicies() {
        return await prisma.policies.findMany({
            where: { status: 'PUBLISHED' },
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Ottiene una policy per ID
     */
    static async getPolicyById(id, includeCreator = false) {
        return (await prisma.policies.findUnique({
            where: { id },
            include: includeCreator
                ? {
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    updatedBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                }
                : undefined,
        }));
    }
    /**
     * Ottiene una policy per slug
     */
    static async getPolicyBySlug(slug) {
        return await prisma.policies.findUnique({
            where: { slug },
        });
    }
    /**
     * Ottiene una policy per tipo
     */
    static async getPolicyByType(type) {
        return await prisma.policies.findUnique({
            where: { type },
        });
    }
    /**
     * Crea una nuova policy
     */
    static async createPolicy(params) {
        const { slug, type, title, content, metaDescription, status, createdById } = params;
        // Verifica che non esista già una policy di questo tipo
        const existing = await this.getPolicyByType(type);
        if (existing) {
            throw new Error(`Una policy di tipo ${type} esiste già`);
        }
        const policy = await prisma.policies.create({
            data: {
                slug,
                type,
                title,
                content,
                metaDescription,
                status: status ?? 'DRAFT',
                version: 1,
                createdById,
                publishedAt: status === 'PUBLISHED' ? new Date() : null,
                updatedAt: new Date(),
            },
        });
        // Crea record nello storico
        await this.createHistoryRecord(policy, createdById, 'Creazione iniziale');
        return policy;
    }
    /**
     * Aggiorna una policy esistente
     */
    static async updatePolicy(params) {
        const { id, slug, title, content, metaDescription, status, updatedById, changeReason } = params;
        // Ottieni policy corrente per storico
        const currentPolicy = await this.getPolicyById(id);
        if (!currentPolicy) {
            throw new Error('Policy non trovata');
        }
        // Prepara i dati da aggiornare
        const updateData = {
            updatedAt: new Date(),
            ...(updatedById
                ? {
                    updatedBy: {
                        connect: { id: updatedById },
                    },
                }
                : {}),
        };
        if (slug !== undefined)
            updateData.slug = slug;
        if (title !== undefined)
            updateData.title = title;
        if (content !== undefined)
            updateData.content = content;
        if (metaDescription !== undefined)
            updateData.metaDescription = metaDescription;
        // Gestione cambio di stato
        if (status !== undefined && status !== currentPolicy.status) {
            updateData.status = status;
            // Se viene pubblicata, incrementa la versione e setta publishedAt
            if (status === 'PUBLISHED' && currentPolicy.status !== 'PUBLISHED') {
                updateData.version = currentPolicy.version + 1;
                updateData.publishedAt = new Date();
            }
        }
        // Aggiorna la policy
        const updatedPolicy = await prisma.policies.update({
            where: { id },
            data: updateData,
        });
        // Crea record nello storico
        await this.createHistoryRecord(updatedPolicy, updatedById, changeReason);
        return updatedPolicy;
    }
    /**
     * Elimina una policy
     */
    static async deletePolicy(id) {
        await prisma.policies.delete({
            where: { id },
        });
    }
    /**
     * Crea un record nello storico
     */
    static async createHistoryRecord(policy, changedBy, changeReason) {
        return await prisma.policy_history.create({
            data: {
                policyId: policy.id,
                version: policy.version,
                slug: policy.slug,
                type: policy.type,
                title: policy.title,
                content: policy.content,
                metaDescription: policy.metaDescription,
                status: policy.status,
                changedBy,
                changeReason,
            },
        });
    }
    /**
     * Ottiene lo storico di una policy
     */
    static async getPolicyHistory(policyId, limit = 20) {
        return await prisma.policy_history.findMany({
            where: { policyId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    /**
     * Ottiene tutto lo storico
     */
    static async getAllHistory(limit = 50) {
        return await prisma.policy_history.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    /**
     * Verifica se uno slug è disponibile
     */
    static async isSlugAvailable(slug, excludeId) {
        const existing = await prisma.policies.findFirst({
            where: {
                slug,
                ...(excludeId && { id: { not: excludeId } }),
            },
        });
        return !existing;
    }
    /**
     * Genera uno slug da un titolo
     */
    static generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    /**
     * Pubblica una policy
     */
    static async publishPolicy(id, userId) {
        return await this.updatePolicy({
            id,
            status: 'PUBLISHED',
            updatedById: userId,
            changeReason: 'Pubblicazione policy',
        });
    }
    /**
     * Archivia una policy
     */
    static async archivePolicy(id, userId) {
        return await this.updatePolicy({
            id,
            status: 'ARCHIVED',
            updatedById: userId,
            changeReason: 'Archiviazione policy',
        });
    }
    /**
     * Ottiene le statistiche delle policy
     */
    static async getPolicyStats() {
        const total = await prisma.policies.count();
        const published = await prisma.policies.count({ where: { status: 'PUBLISHED' } });
        const draft = await prisma.policies.count({ where: { status: 'DRAFT' } });
        const archived = await prisma.policies.count({ where: { status: 'ARCHIVED' } });
        return {
            total,
            published,
            draft,
            archived,
        };
    }
}
