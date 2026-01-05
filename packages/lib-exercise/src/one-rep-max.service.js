/**
 * One Rep Max Service
 *
 * CRUD operations per massimali 1RM degli utenti
 * Implementa SRP e segue pattern consistente con altri services
 *
 * NOMENCLATURA:
 * - catalogExerciseId: ID dell'esercizio nel catalogo (exercises.id)
 *
 * La validazione usa lo schema Zod centralizzato da @onecoach/schemas
 */
import { prisma } from '@onecoach/lib-core/prisma';
import { Prisma } from '@prisma/client';
import { createId } from '@onecoach/lib-shared';
import { OneRepMaxInputSchema } from '@onecoach/schemas';
import { logger } from '@onecoach/lib-core';
export class OneRepMaxService {
    /**
     * Valida l'input usando lo schema Zod centralizzato.
     *
     * @returns OneRepMaxInput validato o null con errore
     */
    static validateInput(input) {
        const result = OneRepMaxInputSchema.safeParse(input);
        if (!result.success) {
            const firstIssue = result.error.issues?.[0];
            return {
                valid: null,
                error: firstIssue?.message || 'Input non valido',
            };
        }
        return { valid: result.data };
    }
    /**
     * Ottiene tutti i massimali di un utente
     */
    static async getByUserId(userId) {
        try {
            if (!prisma) {
                logger.error('[OneRepMaxService] Prisma client not available');
                return {
                    success: false,
                    error: 'Database connection error: Prisma client not initialized',
                };
            }
            if (typeof prisma.user_one_rep_max === 'undefined') {
                logger.error('[OneRepMaxService] userOneRepMax model not available in Prisma client');
                return {
                    success: false,
                    error: 'Database model not available. Please restart the development server.',
                };
            }
            const maxes = await prisma.user_one_rep_max.findMany({
                where: { userId },
                include: {
                    exercises: {
                        include: {
                            exercise_translations: {
                                where: { locale: 'it' },
                                take: 1,
                            },
                        },
                    },
                },
                orderBy: { lastUpdated: 'desc' },
            });
            const normalized = maxes.map((max) => ({
                ...max,
                oneRepMax: Number(max.oneRepMax),
            }));
            return { success: true, data: normalized };
        }
        catch (error) {
            logger.error('[OneRepMaxService.getByUserId]', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Errore nel recupero dei massimali',
            };
        }
    }
    /**
     * Ottiene il massimale per un esercizio specifico
     *
     * @param catalogExerciseId - ID dell'esercizio nel catalogo (alias: exerciseId per retrocompatibilità)
     */
    static async getByExercise(userId, catalogExerciseId) {
        try {
            const max = await prisma.user_one_rep_max.findFirst({
                where: {
                    userId,
                    exerciseId: catalogExerciseId,
                },
                include: {
                    exercises: {
                        include: {
                            exercise_translations: {
                                where: { locale: 'it' },
                                take: 1,
                            },
                        },
                    },
                },
            });
            const normalized = max
                ? {
                    ...max,
                    oneRepMax: Number(max.oneRepMax),
                }
                : null;
            return { success: true, data: normalized };
        }
        catch (error) {
            logger.error('[OneRepMaxService.getByExercise]', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Errore nel recupero del massimale',
            };
        }
    }
    /**
     * Crea o aggiorna un massimale (upsert)
     *
     * La validazione è centralizzata nello schema Zod.
     */
    static async upsert(userId, input) {
        try {
            // Validazione userId
            if (!userId || userId.trim() === '') {
                return {
                    success: false,
                    error: 'User ID non valido',
                };
            }
            // Validazione input con schema Zod
            const { valid: validatedInput, error: validationError } = this.validateInput(input);
            if (!validatedInput) {
                return {
                    success: false,
                    error: validationError || 'Input non valido',
                };
            }
            // Usa catalogExerciseId dallo schema validato
            const catalogExerciseId = validatedInput.catalogExerciseId;
            // Verifica esistenza utente
            const user = await prisma.users.findUnique({
                where: { id: userId },
                select: { id: true },
            });
            if (!user) {
                return {
                    success: false,
                    error: 'Utente non trovato nel database',
                };
            }
            // Verifica esistenza esercizio nel catalogo
            const exercise = await prisma.exercises.findUnique({
                where: { id: catalogExerciseId },
            });
            if (!exercise) {
                return {
                    success: false,
                    error: `Esercizio non trovato nel catalogo (ID: ${catalogExerciseId})`,
                };
            }
            const existingMax = await prisma.user_one_rep_max.findFirst({
                where: {
                    userId,
                    exerciseId: catalogExerciseId,
                },
            });
            if (existingMax) {
                const hasChanges = Number(existingMax.oneRepMax) !== validatedInput.oneRepMax ||
                    existingMax.notes !== (validatedInput.notes ?? null);
                if (hasChanges) {
                    await prisma.user_one_rep_max_versions.create({
                        data: {
                            id: createId(),
                            maxId: existingMax.id,
                            userId: existingMax.userId ?? userId,
                            exerciseId: existingMax.exerciseId,
                            oneRepMax: existingMax.oneRepMax,
                            notes: existingMax.notes,
                            version: existingMax.version,
                            createdBy: userId,
                        },
                    });
                    const newVersion = existingMax.version + 1;
                    const max = await prisma.user_one_rep_max.update({
                        where: {
                            id: existingMax.id,
                        },
                        data: {
                            oneRepMax: validatedInput.oneRepMax,
                            notes: validatedInput.notes ?? null,
                            version: newVersion,
                            lastUpdated: new Date(),
                        },
                        include: {
                            exercises: {
                                include: {
                                    exercise_translations: {
                                        where: { locale: 'it' },
                                        take: 1,
                                    },
                                },
                            },
                        },
                    });
                    const normalized = {
                        ...max,
                        oneRepMax: Number(max.oneRepMax),
                    };
                    return { success: true, data: normalized };
                }
                else {
                    const normalized = {
                        ...existingMax,
                        oneRepMax: Number(existingMax.oneRepMax),
                    };
                    const exerciseData = await prisma.exercises.findUnique({
                        where: { id: existingMax.exerciseId },
                        include: {
                            exercise_translations: {
                                where: { locale: 'it' },
                                take: 1,
                            },
                        },
                    });
                    if (exerciseData) {
                        normalized.exercise = {
                            id: exerciseData.id,
                            slug: exerciseData.slug,
                            translations: exerciseData.exercise_translations.map((t) => ({
                                name: t.name,
                                locale: t.locale,
                            })),
                        };
                    }
                    return { success: true, data: normalized };
                }
            }
            const max = await prisma.user_one_rep_max.create({
                data: {
                    id: createId(),
                    userId,
                    exerciseId: catalogExerciseId,
                    oneRepMax: validatedInput.oneRepMax,
                    notes: validatedInput.notes ?? null,
                    version: 1,
                },
                include: {
                    exercises: {
                        include: {
                            exercise_translations: {
                                where: { locale: 'it' },
                                take: 1,
                            },
                        },
                    },
                },
            });
            const normalized = {
                ...max,
                oneRepMax: Number(max.oneRepMax),
            };
            return { success: true, data: normalized };
        }
        catch (error) {
            if (error instanceof Error) {
                const prismaError = error;
                if (prismaError.code === 'P2002') {
                    return {
                        success: false,
                        error: 'Esiste già un massimale per questo esercizio',
                    };
                }
                if (prismaError.code === 'P2003') {
                    const field = prismaError.meta?.field_name || 'relazione';
                    if (field.includes('userId')) {
                        return {
                            success: false,
                            error: 'Utente non trovato nel database. Effettua il login di nuovo.',
                        };
                    }
                    if (field.includes('exerciseId')) {
                        return {
                            success: false,
                            error: 'Esercizio non trovato nel database',
                        };
                    }
                    return {
                        success: false,
                        error: `Errore di integrità referenziale: ${field}`,
                    };
                }
            }
            logger.error('[OneRepMaxService.upsert]', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Errore nel salvataggio del massimale',
            };
        }
    }
    /**
     * Ottiene la cronologia delle versioni di un massimale
     *
     * @param catalogExerciseId - ID dell'esercizio nel catalogo
     */
    static async getVersions(userId, catalogExerciseId) {
        try {
            const max = await prisma.user_one_rep_max.findFirst({
                where: {
                    userId,
                    exerciseId: catalogExerciseId,
                },
            });
            if (!max) {
                return {
                    success: false,
                    error: 'Massimale non trovato',
                };
            }
            const versions = await prisma.user_one_rep_max_versions.findMany({
                where: { maxId: max.id },
                orderBy: { version: 'desc' },
            });
            const normalized = versions.map((v) => ({
                ...v,
                oneRepMax: Number(v.oneRepMax),
            }));
            return { success: true, data: normalized };
        }
        catch (error) {
            logger.error('[OneRepMaxService.getVersions]', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Errore nel recupero delle versioni',
            };
        }
    }
    /**
     * Elimina un massimale
     *
     * @param catalogExerciseId - ID dell'esercizio nel catalogo
     */
    static async delete(userId, catalogExerciseId) {
        try {
            const existing = await prisma.user_one_rep_max.findFirst({
                where: { userId, exerciseId: catalogExerciseId },
            });
            if (!existing) {
                return {
                    success: false,
                    error: 'Massimale non trovato',
                };
            }
            await prisma.user_one_rep_max.delete({
                where: { id: existing.id },
            });
            return { success: true };
        }
        catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                return {
                    success: false,
                    error: 'Massimale non trovato',
                };
            }
            logger.error('[OneRepMaxService.delete]', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Errore nell'eliminazione del massimale",
            };
        }
    }
    /**
     * Ottiene i massimali per più esercizi contemporaneamente (batch lookup)
     *
     * @param catalogExerciseIds - Array di ID esercizi dal catalogo
     */
    static async getBatchByExercises(userId, catalogExerciseIds) {
        try {
            const maxes = await prisma.user_one_rep_max.findMany({
                where: {
                    userId,
                    exerciseId: { in: catalogExerciseIds },
                },
            });
            const map = new Map();
            for (const max of maxes) {
                const normalized = {
                    ...max,
                    oneRepMax: Number(max.oneRepMax),
                };
                map.set(max.exerciseId, normalized);
            }
            return { success: true, data: map };
        }
        catch (error) {
            logger.error('[OneRepMaxService.getBatchByExercises]', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Errore nel recupero batch dei massimali',
            };
        }
    }
}
