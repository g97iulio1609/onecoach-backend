/**
 * Exercise Admin Service
 *
 * Utility dedicate alla gestione avanzata del catalogo esercizi:
 * - Import/export in formato JSON con deduplica
 * - Operazioni batch (CRUD) e automazioni AI
 */
import { prisma } from '@onecoach/lib-core';
import { ExerciseService } from './exercise.service';
import { toSlug } from '@onecoach/lib-shared';
import { createExerciseSchema, updateExerciseSchema, } from '@onecoach/schemas';
import { validateExerciseTypeByName } from '@onecoach/lib-metadata';
import { z } from 'zod';
const DEFAULT_LOCALE = 'en';
const DEFAULT_APPROVED_STATUS = 'APPROVED';
const DEFAULT_PENDING_STATUS = 'PENDING';
/**
 * Schema per import payload (estende createExerciseSchema con campi admin)
 * Usa SOLO ID (non nomi) per garantire coerenza e evitare incompatibilità
 *
 * IMPORTANTE: translations, muscles, e bodyPartIds sono OBBLIGATORI (ereditati da createExerciseSchema)
 */
const exerciseImportExtension = z.object({
    approvalStatus: z.enum(['APPROVED', 'PENDING']).optional(),
});
// Intersezione: mantiene i campi obbligatori da createExerciseSchema (translations, muscles, bodyPartIds)
// Nota: Zod intersection mantiene i requisiti più restrittivi, quindi i campi obbligatori da createExerciseSchema
// rimangono obbligatori anche se sono opzionali in exerciseImportExtension
const exerciseImportSchemaBase = z.intersection(createExerciseSchema, exerciseImportExtension);
// Validazione esplicita per assicurarsi che i campi obbligatori siano sempre presenti
export const exerciseImportSchema = exerciseImportSchemaBase.superRefine((data, ctx) => {
    // Verifica translations
    if (!data.translations || !Array.isArray(data.translations) || data.translations.length === 0) {
        ctx.addIssue({
            code: 'custom',
            message: 'translations è obbligatorio e deve contenere almeno una traduzione',
            path: ['translations'],
        });
    }
    // Verifica muscles
    if (!data.muscles || !Array.isArray(data.muscles) || data.muscles.length === 0) {
        ctx.addIssue({
            code: 'custom',
            message: 'muscles è obbligatorio e deve contenere almeno un muscolo',
            path: ['muscles'],
        });
    }
    // Verifica bodyPartIds
    if (!data.bodyPartIds || !Array.isArray(data.bodyPartIds) || data.bodyPartIds.length === 0) {
        ctx.addIssue({
            code: 'custom',
            message: 'bodyPartIds è obbligatorio e deve contenere almeno una parte del corpo',
            path: ['bodyPartIds'],
        });
    }
    // Verifica exerciseTypeId (obbligatorio)
    if (!data.exerciseTypeId || data.exerciseTypeId.trim() === '') {
        ctx.addIssue({
            code: 'custom',
            message: 'exerciseTypeId è obbligatorio e non può essere vuoto',
            path: ['exerciseTypeId'],
        });
    }
    // Verifica che tutte le traduzioni abbiano il nome
    if (data.translations && Array.isArray(data.translations)) {
        data.translations.forEach((translation, index) => {
            if (!translation.name || translation.name.trim() === '') {
                ctx.addIssue({
                    code: 'custom',
                    message: `Il nome è obbligatorio per la traduzione in ${translation.locale || 'locale sconosciuto'}`,
                    path: ['translations', index, 'name'],
                });
            }
        });
    }
});
/**
 * Schema per piano AI (CRUD batch)
 */
export const exerciseAiPlanSchema = z.object({
    create: z.array(exerciseImportSchema).default([]),
    update: z
        .array(z.object({
        slug: z.string().trim().min(1),
        data: updateExerciseSchema,
    }))
        .default([]),
    delete: z.array(z.object({ slug: z.string().trim().min(1) })).default([]),
    approve: z
        .array(z.object({
        slug: z.string().trim().min(1),
        status: z.enum(['APPROVED', 'PENDING']).default(DEFAULT_APPROVED_STATUS),
    }))
        .default([]),
    summary: z.string().optional(),
});
const EXERCISE_EXPORT_INCLUDE = {
    exercise_translations: true,
    exercise_types: true, // Include exerciseType relation to get the name
    exercise_muscles: {
        include: {
            muscles: true,
        },
    },
    exercise_body_parts: {
        include: {
            body_parts: true,
        },
    },
    exercise_equipments: {
        include: {
            equipments: true,
        },
    },
    relatedFrom: {
        include: {
            exercises_exercise_relations_toIdToexercises: {
                select: {
                    id: true,
                    slug: true,
                },
            },
        },
    },
};
export class ExerciseAdminService {
    /**
     * Esporta l'intero catalogo esercizi (opzionalmente includendo quelli non approvati)
     */
    static async exportAll(options = {}) {
        const exercises = await prisma.exercises.findMany({
            where: options.includeUnapproved ? {} : { approvalStatus: DEFAULT_APPROVED_STATUS },
            include: EXERCISE_EXPORT_INCLUDE,
            orderBy: { createdAt: 'asc' },
        });
        return exercises.map((exercise) => this.formatExportRecord(exercise));
    }
    /**
     * Importa esercizi evitando duplicati (basato su slug) con supporto merge
     */
    static async import(records, options = {}) {
        const summary = {
            created: 0,
            updated: 0,
            skipped: 0,
            createdItems: [],
            updatedItems: [],
            skippedSlugs: [],
            errors: [],
        };
        if (records.length === 0) {
            return summary;
        }
        const normalizedRecords = await Promise.all(records.map((record) => this.normalizeImportRecord(record, options.sharedContext)));
        const slugCache = new Map();
        for (let i = 0; i < normalizedRecords.length; i++) {
            const record = normalizedRecords[i];
            if (!record)
                continue;
            options.onProgress?.(i + 1, normalizedRecords.length);
            try {
                // ensureTaxonomy non serve più - la validazione è già fatta in normalizeImportRecord
                // Gli ID sono già validati e pronti all'uso
                const relationAdditions = await this.resolveRelations(record.relationRefs, slugCache);
                record.createInput.relatedExercises = this.mergeRelations(record.createInput.relatedExercises, relationAdditions);
                record.updateInput.relatedExercises = this.mergeRelations(record.updateInput.relatedExercises, relationAdditions);
                const existing = await prisma.exercises.findUnique({
                    where: { slug: record.slug },
                    select: { id: true, approvalStatus: true },
                });
                if (!existing) {
                    const targetStatus = record.approvalStatus ??
                        (options.autoApprove ? DEFAULT_APPROVED_STATUS : DEFAULT_PENDING_STATUS);
                    const created = await ExerciseService.create(record.createInput, {
                        userId: options.userId,
                        autoApprove: targetStatus === DEFAULT_APPROVED_STATUS,
                    });
                    slugCache.set(record.slug, created.id);
                    summary.created += 1;
                    summary.createdItems.push({ id: created.id, slug: created.slug });
                    if (targetStatus !== created.approvalStatus && options.userId) {
                        await ExerciseService.setApprovalStatus(created.id, targetStatus, {
                            userId: options.userId,
                        });
                    }
                    continue;
                }
                if (options.mergeExisting === false) {
                    summary.skipped += 1;
                    summary.skippedSlugs.push(record.slug);
                    continue;
                }
                const updated = await ExerciseService.update(existing.id, record.updateInput, {
                    userId: options.userId,
                    includeTranslations: true,
                });
                slugCache.set(record.slug, updated.id);
                summary.updated += 1;
                summary.updatedItems.push({ id: updated.id, slug: updated.slug });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                summary.errors.push({
                    slug: record.slug,
                    reason: errorMessage,
                });
            }
        }
        options.onProgress?.(normalizedRecords.length, normalizedRecords.length);
        return summary;
    }
    /**
     * Normalizza payload di import generando slug e campi coerenti
     */
    static async normalizeImportRecord(payload, sharedContext) {
        // Validate required fields early
        if (!payload.translations ||
            !Array.isArray(payload.translations) ||
            payload.translations.length === 0) {
            throw new Error('Ogni esercizio deve avere almeno una traduzione');
        }
        const legacyMuscleField = 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payload.muscleGroup ?? payload.muscleGroups;
        if (legacyMuscleField !== undefined) {
            throw new Error('I campi legacy "muscleGroup" o "muscleGroups" non sono supportati. Fornisci "muscles": [{ id, role }] e "bodyPartIds".');
        }
        if (!payload.muscles || !Array.isArray(payload.muscles) || payload.muscles.length === 0) {
            throw new Error('Ogni esercizio deve avere almeno un muscolo');
        }
        if (!payload.bodyPartIds ||
            !Array.isArray(payload.bodyPartIds) ||
            payload.bodyPartIds.length === 0) {
            throw new Error('Ogni esercizio deve avere almeno una parte del corpo');
        }
        const translations = payload.translations.map((translation) => ({
            ...translation,
            locale: translation.locale.toLowerCase(),
            shortName: translation.shortName ?? undefined,
            description: translation.description ?? undefined,
            searchTerms: translation.searchTerms ?? [],
        }));
        const english = translations.find((translation) => translation.locale === DEFAULT_LOCALE);
        if (!english) {
            throw new Error("È necessaria una traduzione in inglese per importare l'esercizio");
        }
        const slug = payload.slug?.trim() || toSlug(english.name);
        // Valida e normalizza exerciseTypeId: OBBLIGATORIO - verifica se è un ID valido o converte da nome
        if (!payload.exerciseTypeId ||
            payload.exerciseTypeId === null ||
            payload.exerciseTypeId.trim() === '') {
            throw new Error('exerciseTypeId è obbligatorio e non può essere vuoto');
        }
        const providedId = payload.exerciseTypeId.trim();
        let exerciseTypeId;
        // Verifica se è un ID valido nel database
        const existingType = await prisma.exercise_types.findUnique({
            where: { id: providedId },
            select: { id: true },
        });
        if (existingType) {
            // È un ID valido
            exerciseTypeId = providedId;
        }
        else {
            // Non è un ID valido, prova a convertirlo da nome
            // Usa il servizio di validazione metadata
            const convertedId = await validateExerciseTypeByName(providedId, sharedContext);
            if (!convertedId) {
                throw new Error(`exerciseTypeId non valido: "${providedId}" non è né un ID esistente né un nome valido di exercise type`);
            }
            exerciseTypeId = convertedId;
        }
        // Muscoli: usa solo ID (obbligatorio)
        const muscles = payload.muscles.map((muscle) => ({
            id: muscle.id, // ID è obbligatorio, non più opzionale
            role: muscle.role,
        }));
        // BodyParts: usa solo bodyPartIds (obbligatorio)
        const bodyPartIds = payload.bodyPartIds || [];
        // Equipment: usa solo equipmentIds (opzionale)
        const equipmentIds = payload.equipmentIds || undefined;
        // Related exercises: usa solo ID
        const relatedWithIds = payload.relatedExercises
            ? payload.relatedExercises.map((relation) => ({
                id: relation.id,
                relation: relation.relation,
                direction: relation.direction ?? 'outbound',
            }))
            : [];
        const createInput = {
            slug,
            exerciseTypeId,
            overview: payload.overview ?? undefined,
            imageUrl: payload.imageUrl ?? undefined,
            videoUrl: payload.videoUrl ?? undefined,
            keywords: payload.keywords ?? [],
            instructions: payload.instructions ?? [],
            exerciseTips: payload.exerciseTips ?? [],
            variations: payload.variations ?? [],
            translations,
            muscles,
            bodyPartIds,
            equipmentIds,
            relatedExercises: relatedWithIds.length ? relatedWithIds : undefined,
            isUserGenerated: payload.isUserGenerated ?? undefined,
        };
        // Rimossa logica legacy relatedBySlug - usa solo relatedExercises con ID
        const relationRefs = [];
        const updateInput = {
            slug,
            exerciseTypeId,
            overview: payload.overview ?? undefined,
            imageUrl: payload.imageUrl ?? undefined,
            videoUrl: payload.videoUrl ?? undefined,
            keywords: payload.keywords ?? undefined,
            instructions: payload.instructions ?? undefined,
            exerciseTips: payload.exerciseTips ?? undefined,
            variations: payload.variations ?? undefined,
            translations,
            muscles: createInput.muscles,
            bodyPartIds: createInput.bodyPartIds,
            equipmentIds: createInput.equipmentIds,
            relatedExercises: createInput.relatedExercises,
            isUserGenerated: payload.isUserGenerated ?? undefined,
            approvalStatus: payload.approvalStatus ?? undefined,
        };
        return {
            slug,
            createInput,
            updateInput,
            relationRefs,
            approvalStatus: payload.approvalStatus ?? undefined,
        };
    }
    /**
     * Risolve le relazioni basate su slug → ID
     */
    static async resolveRelations(relations, slugCache) {
        if (relations.length === 0) {
            return [];
        }
        const resolved = [];
        for (const relation of relations) {
            if (!relation.slug) {
                continue;
            }
            const cachedId = slugCache.get(relation.slug);
            let targetId = cachedId;
            if (!targetId) {
                const existing = await prisma.exercises.findUnique({
                    where: { slug: relation.slug },
                    select: { id: true },
                });
                if (existing) {
                    targetId = existing.id;
                    slugCache.set(relation.slug, existing.id);
                }
            }
            if (!targetId) {
                continue;
            }
            resolved.push({
                id: targetId,
                relation: relation.relation,
                direction: relation.direction,
            });
        }
        return resolved;
    }
    /**
     * Unisce relazioni rimuovendo duplicati
     */
    static mergeRelations(base, additions) {
        if (!additions.length && !base?.length) {
            return base;
        }
        const dedup = new Map();
        const upsert = (relation) => {
            const key = `${relation.id}:${relation.relation}:${relation.direction ?? 'outbound'}`;
            if (!dedup.has(key)) {
                dedup.set(key, {
                    id: relation.id,
                    relation: relation.relation,
                    direction: relation.direction ?? 'outbound',
                });
            }
        };
        base?.forEach(upsert);
        additions.forEach(upsert);
        return Array.from(dedup.values());
    }
    /**
     * Mappa esercizio (con relazioni) in record esportabile
     */
    static formatExportRecord(exercise) {
        return {
            id: exercise.id,
            slug: exercise.slug,
            approvalStatus: exercise.approvalStatus,
            approvedAt: exercise.approvedAt ? exercise.approvedAt.toISOString() : null,
            version: exercise.version,
            isUserGenerated: exercise.isUserGenerated,
            createdAt: exercise.createdAt.toISOString(),
            updatedAt: exercise.updatedAt.toISOString(),
            exerciseTypeId: exercise.exerciseTypeId ?? null,
            overview: exercise.overview ?? null,
            imageUrl: exercise.imageUrl ?? null,
            videoUrl: exercise.videoUrl ?? null,
            keywords: [...exercise.keywords],
            instructions: [...exercise.instructions],
            exerciseTips: [...exercise.exerciseTips],
            variations: [...exercise.variations],
            translations: exercise.exercise_translations.map((translation) => ({
                locale: translation.locale.toLowerCase(),
                name: translation.name,
                shortName: translation.shortName ?? null,
                description: translation.description ?? null,
                searchTerms: translation.searchTerms ?? [],
            })),
            muscles: exercise.exercise_muscles.map((muscle) => ({
                id: muscle.muscleId,
                role: muscle.role,
            })),
            bodyPartIds: exercise.exercise_body_parts.map((bodyPart) => bodyPart.bodyPartId),
            equipmentIds: exercise.exercise_equipments.map((equipment) => equipment.equipmentId),
            relatedExercises: exercise.relatedFrom.map((relation) => ({
                id: relation.toId,
                relation: relation.relation,
                direction: 'outbound',
            })),
        };
    }
}
