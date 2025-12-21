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
import { getModelByTier } from '@onecoach/lib-ai-agents/core/providers';
import { createCustomModel } from '@onecoach/lib-ai-agents/utils/model-factory';
import { MODEL_CONSTANTS } from '@onecoach/lib-ai-agents';
import { AIProviderConfigService } from '@onecoach/lib-ai';
import { streamText, Output, stepCountIs } from 'ai';
import { parseJsonResponse } from '@onecoach/lib-ai-agents/utils/json-parser';
import { z } from 'zod';
import { ExerciseGenerationAgent, createAgentInstance, createAIAgentConfig, } from '@onecoach/one-agent';
import { processBatchesInParallel } from '@onecoach/lib-shared/batch-processing';
import { normalizeUrl } from '@onecoach/lib-shared/url-normalizer';
import { getAllMetadataForLocale, validateExerciseTypeByName } from '@onecoach/lib-metadata';
import { TOKEN_LIMITS } from '@onecoach/constants/models';
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
const EXERCISE_AI_SYSTEM_PROMPT = `
You are an assistant that helps manage a structured exercise database for a fitness platform.

CRITICAL REQUIREMENTS - ALL exercises in the "create" array MUST include:
1. **exerciseTypeId**: Exercise type ID string (MANDATORY - use ONLY IDs from the available list, NEVER names)
2. **translations**: Array with at least ONE translation. English (locale: "en") is MANDATORY for every exercise. Italian (locale: "it") is preferred as secondary locale. Each translation MUST have a "name" field (MANDATORY).
3. **muscles**: Array with at least ONE muscle object with "id" (muscle ID string) and "role" ("PRIMARY" or "SECONDARY").
4. **bodyPartIds**: Array with at least ONE body part ID (string).

Always return a JSON object that matches the provided schema. 

Available approval statuses: APPROVED, PENDING, REJECTED. Prefer APPROVED for high-quality, verified content.

CRITICAL: Use ONLY IDs (strings), NEVER names:
- exerciseTypeId: Exercise type ID string (MANDATORY - must be from the available list)
- muscles: Array of objects with "id" (muscle ID string) and "role" ("PRIMARY" or "SECONDARY")
- bodyPartIds: Array of body part ID strings
- equipmentIds: Array of equipment ID strings (optional)

IMPORTANT: The prompt will include a list of AVAILABLE METADATA IDs. You MUST use ONLY the IDs from that list. Do NOT invent IDs or use names. If an ID is not in the provided list, do not use it.

When creating new exercises, provide:
- Detailed instructions (array of strings)
- At least one exercise tip (array of strings)
- Variations when useful (array of strings)
- Keywords (array of lower-case tags)
- imageUrl and videoUrl: ONLY include if you have a valid, accessible URL. If you don't have a real URL, omit these fields entirely (do NOT include empty strings or placeholder URLs).

When updating or deleting, reference exercises by their slug.

Return concise operations; avoid duplicates and keep data consistent.

IMPORTANT: Never create exercises without exerciseTypeId, translations (with names), muscles, or bodyPartIds. If you cannot provide these required fields, do not include the exercise in the "create" array.

EXAMPLE JSON OUTPUT:
{
  "create": [
    {
      "slug": "barbell-bench-press",
      "exerciseTypeId": "cmi2034w37ctuv602pf20s",
      "overview": "A compound upper body exercise targeting chest, shoulders, and triceps",
      "keywords": ["chest", "bench press", "barbell", "strength", "compound"],
      "instructions": [
        "Lie flat on bench with feet on floor",
        "Grip barbell slightly wider than shoulder-width",
        "Lower bar to chest with control",
        "Press bar up explosively to full arm extension"
      ],
      "exerciseTips": [
        "Keep core engaged throughout the movement",
        "Don't arch back excessively",
        "Control the descent for 2-3 seconds"
      ],
      "variations": ["Dumbbell bench press", "Incline bench press", "Decline bench press"],
      "translations": [
        {
          "locale": "en",
          "name": "Barbell Bench Press",
          "description": "A compound exercise performed lying on a bench, pressing a barbell from chest level to full arm extension. Targets the pectoral muscles, anterior deltoids, and triceps.",
          "searchTerms": ["bench", "press", "chest", "barbell", "pectorals"]
        },
        {
          "locale": "it",
          "name": "Panca con Bilanciere",
          "description": "Esercizio composto eseguito sdraiato su una panca, spingendo un bilanciere dal livello del petto fino alla completa estensione delle braccia. Interessa i muscoli pettorali, deltoidi anteriori e tricipiti.",
          "searchTerms": ["panca", "bilanciere", "petto", "pettorali"]
        }
      ],
      "muscles": [
        { "id": "muscle_chest_primary", "role": "PRIMARY" },
        { "id": "muscle_shoulders_anterior", "role": "SECONDARY" },
        { "id": "muscle_triceps", "role": "SECONDARY" }
      ],
      "bodyPartIds": ["bodypart_upper_body"],
      "equipmentIds": ["equipment_barbell", "equipment_bench"],
      "approvalStatus": "APPROVED"
    }
  ],
  "update": [],
  "delete": [],
  "approve": [],
  "summary": "Created 1 new exercise: Barbell Bench Press"
}`.trim();
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
     * Esegue un piano di operazioni generato via AI (create/update/delete/approve)
     */
    static async executeAiPlan(options) {
        const plan = await this.generateAiPlan(options.prompt);
        const slugCache = new Map();
        // Validate that we have metadata before processing
        const metadata = await getAllMetadataForLocale('en');
        if (!metadata.muscles ||
            metadata.muscles.length === 0 ||
            !metadata.bodyParts ||
            metadata.bodyParts.length === 0) {
            return {
                summary: 'Unable to create exercises: database metadata (muscles, body parts) not found. Please run: pnpm db:seed',
                createResult: null,
                updateResult: [],
                deleteResult: [],
                approvalResult: [],
                plan,
            };
        }
        // Filter out incomplete exercises before import
        const validCreateRecords = plan.create.filter((exercise) => {
            const hasTranslations = exercise.translations &&
                Array.isArray(exercise.translations) &&
                exercise.translations.length > 0;
            const hasMuscles = exercise.muscles && Array.isArray(exercise.muscles) && exercise.muscles.length > 0;
            const hasBodyParts = exercise.bodyPartIds &&
                Array.isArray(exercise.bodyPartIds) &&
                exercise.bodyPartIds.length > 0;
            if (!hasTranslations || !hasMuscles || !hasBodyParts) {
                return false;
            }
            return true;
        });
        const createResult = validCreateRecords.length > 0
            ? await this.import(validCreateRecords, {
                userId: options.userId,
                autoApprove: options.autoApprove,
                mergeExisting: options.mergeExisting,
            })
            : null;
        if (createResult) {
            for (const item of createResult.createdItems) {
                slugCache.set(item.slug, item.id);
            }
            for (const item of createResult.updatedItems) {
                slugCache.set(item.slug, item.id);
            }
        }
        const updateResult = [];
        for (const entry of plan.update) {
            try {
                const exercise = slugCache.get(entry.slug) ??
                    (await prisma.exercises.findUnique({
                        where: { slug: entry.slug },
                        select: { id: true },
                    }))?.id;
                if (!exercise) {
                    updateResult.push({
                        slug: entry.slug,
                        success: false,
                        error: 'Esercizio non trovato',
                    });
                    continue;
                }
                const updated = await ExerciseService.update(exercise, entry.data, {
                    userId: options.userId,
                    includeTranslations: true,
                });
                slugCache.set(entry.slug, updated.id);
                updateResult.push({ slug: entry.slug, success: true });
            }
            catch (error) {
                updateResult.push({
                    slug: entry.slug,
                    success: false,
                    error: error instanceof Error ? error.message : 'Errore sconosciuto',
                });
            }
        }
        const deleteResult = [];
        if (plan.delete.length > 0) {
            const slugs = plan.delete.map((item) => item.slug);
            const existing = await prisma.exercises.findMany({
                where: { slug: { in: slugs } },
                select: { id: true, slug: true },
            });
            const existingMap = new Map(existing.map((item) => [item.slug, item.id]));
            const idsToDelete = existing.map((item) => item.id);
            if (idsToDelete.length > 0) {
                await ExerciseService.deleteMany(idsToDelete);
            }
            for (const slug of slugs) {
                if (existingMap.has(slug)) {
                    deleteResult.push({ slug, success: true });
                }
                else {
                    deleteResult.push({ slug, success: false, error: 'Esercizio non trovato' });
                }
            }
        }
        const approvalResult = [];
        for (const entry of plan.approve) {
            try {
                const exercise = slugCache.get(entry.slug) ??
                    (await prisma.exercises.findUnique({
                        where: { slug: entry.slug },
                        select: { id: true },
                    }))?.id;
                if (!exercise) {
                    approvalResult.push({
                        slug: entry.slug,
                        status: entry.status,
                        success: false,
                        error: 'Esercizio non trovato',
                    });
                    continue;
                }
                if (!options.userId) {
                    approvalResult.push({
                        slug: entry.slug,
                        status: entry.status,
                        success: false,
                        error: 'UserId richiesto per aggiornare lo stato di approvazione',
                    });
                    continue;
                }
                await ExerciseService.setApprovalStatus(exercise, entry.status, {
                    userId: options.userId,
                });
                approvalResult.push({ slug: entry.slug, status: entry.status, success: true });
            }
            catch (error) {
                approvalResult.push({
                    slug: entry.slug,
                    status: entry.status,
                    success: false,
                    error: error instanceof Error ? error.message : 'Errore sconosciuto',
                });
            }
        }
        return {
            summary: plan.summary,
            createResult,
            updateResult,
            deleteResult,
            approvalResult,
            plan,
        };
    }
    /**
     * Generate exercises using ExerciseGenerationAgent (OneAgent SDK 2.5)
     * Uses parallel batch processing for better performance
     */
    static async generateExercisesWithAgent(options) {
        const { count, muscleGroups, equipment, difficulty, variations, bodyPartIds, exerciseTypeId, description, existingExercises, userId, 
        // Gli esercizi generati con AI vengono automaticamente approvati per default
        autoApprove = true, mergeExisting = false, onProgress, } = options;
        // Get existing exercises for duplicate prevention
        // Include more context: name + slug for better duplicate detection
        const existingNames = existingExercises || [];
        if (existingNames.length === 0) {
            // Fetch more exercises (500 instead of 200) and include both name and slug
            const allExercises = await prisma.exercises.findMany({
                select: {
                    slug: true,
                    exercise_translations: { where: { locale: 'en' }, select: { name: true } },
                },
                take: 500, // Increased from 200 to 500 for better duplicate prevention
                orderBy: { createdAt: 'desc' }, // Get most recent exercises first
            });
            // Format as "Name (slug)" for better context, or just name if slug is similar
            existingNames.push(...allExercises.map((e) => {
                const name = e.exercise_translations[0]?.name || e.slug;
                const slug = e.slug;
                // If slug is very similar to name, just use name; otherwise include both
                const nameSlug = toSlug(name);
                if (nameSlug === slug || nameSlug.replace(/-/g, '') === slug.replace(/-/g, '')) {
                    return name;
                }
                return `${name} (${slug})`;
            }));
            console.warn(`[ExerciseAdminService] Loaded ${existingNames.length} existing exercises for duplicate prevention`);
        }
        // Create AI agent configuration using shared utility
        const agentConfig = await createAIAgentConfig({
            modelTier: 'balanced',
            temperature: MODEL_CONSTANTS.DEFAULT_TEMPERATURE,
            maxTokens: TOKEN_LIMITS.DEFAULT_MAX_TOKENS,
        });
        // Fetch available metadata IDs to pass to agent
        const metadata = await getAllMetadataForLocale('en');
        // Validate that we have metadata
        if (!metadata.muscles || metadata.muscles.length === 0) {
            throw new Error('No muscles found in database. Please run database seed: pnpm db:seed or pnpm db:reset');
        }
        if (!metadata.bodyParts || metadata.bodyParts.length === 0) {
            throw new Error('No body parts found in database. Please run database seed: pnpm db:seed or pnpm db:reset');
        }
        // Build ID maps for AI (ID → English name for reasoning)
        const availableMuscleIds = metadata.muscles.map((m) => `${m.id}: ${m.name}`).join(', ');
        const availableBodyPartIds = metadata.bodyParts
            .map((bp) => `${bp.id}: ${bp.name}`)
            .join(', ');
        const availableEquipmentIds = metadata.equipment
            .map((e) => `${e.id}: ${e.name}`)
            .join(', ');
        const availableExerciseTypeIds = metadata.exerciseTypes
            .map((et) => `${et.id}: ${et.name}`)
            .join(', ');
        // Enhance description with available IDs
        const enhancedDescription = description
            ? `${description}

AVAILABLE METADATA IDs (use these IDs in your response, NOT names):
- Muscles (ID: English Name): ${availableMuscleIds || 'None available'}
- Body Parts (ID: English Name): ${availableBodyPartIds || 'None available'}
- Equipment (ID: English Name): ${availableEquipmentIds || 'None available'}
- Exercise Types (ID: English Name): ${availableExerciseTypeIds || 'None available'}

CRITICAL: Use ONLY the IDs listed above. Do NOT invent IDs or use names.`
            : `AVAILABLE METADATA IDs (use these IDs in your response, NOT names):
- Muscles (ID: English Name): ${availableMuscleIds || 'None available'}
- Body Parts (ID: English Name): ${availableBodyPartIds || 'None available'}
- Equipment (ID: English Name): ${availableEquipmentIds || 'None available'}
- Exercise Types (ID: English Name): ${availableExerciseTypeIds || 'None available'}

CRITICAL: Use ONLY the IDs listed above. Do NOT invent IDs or use names.`;
        // Create ExerciseGenerationAgent using shared utility
        const agent = createAgentInstance(ExerciseGenerationAgent, agentConfig);
        // Create a single shared context for all batches to avoid duplicate metadata creation
        // Use plain objects instead of Map for better compatibility and thread-safety
        const metadataStore = {
            createdExerciseTypes: {}, // name -> id
            createdEquipments: {}, // name -> id
            createdMuscles: {}, // name -> id
            createdBodyParts: {}, // name -> id
        };
        const sharedContext = {
            requestId: `exercise-gen-${Date.now()}`,
            input: {},
            userId: userId || '',
            partialResults: {},
            executionHistory: [],
            currentStep: 'exercise_generation',
            metadata: {
                startedAt: new Date(),
                lastUpdatedAt: new Date(),
                // Track created metadata to avoid duplicates across parallel batches
                // Using plain objects for better compatibility
                createdExerciseTypes: metadataStore.createdExerciseTypes,
                createdEquipments: metadataStore.createdEquipments,
                createdMuscles: metadataStore.createdMuscles,
                createdBodyParts: metadataStore.createdBodyParts,
            },
            needsRetry: false,
            retryCount: 0,
            maxRetries: 2,
        };
        // Generate exercises in batches using shared batch processing utility
        const batchSize = 5; // Generate 5 exercises per batch
        const batches = Math.ceil(count / batchSize);
        const batchIndices = Array.from({ length: batches }, (_, i) => i);
        // Progress ranges: 10-60% for generation, 60-75% for validation, 75-95% for import
        const generationStartProgress = 10;
        const generationEndProgress = 60;
        const validationStartProgress = 60;
        const validationEndProgress = 75;
        const importStartProgress = 75;
        const importEndProgress = 95;
        onProgress?.(generationStartProgress, `Iniziando generazione di ${count} esercizi in ${batches} batch...`);
        console.warn(`[ExerciseAdminService] Starting generation: ${count} exercises in ${batches} batches`);
        let generatedCount = 0;
        const allExercises = await processBatchesInParallel({
            items: batchIndices,
            batchSize: 1, // Process one batch index at a time, but in parallel groups
            parallelGroups: 2,
            processor: async (batch) => {
                const batchIdx = batch[0]; // Get the batch index
                if (batchIdx === undefined)
                    return [];
                const batchCount = Math.min(batchSize, count - batchIdx * batchSize);
                if (batchCount <= 0)
                    return [];
                try {
                    onProgress?.(generationStartProgress +
                        (batchIdx / batches) * (generationEndProgress - generationStartProgress), `Generando batch ${batchIdx + 1}/${batches} (${batchCount} esercizi)...`);
                    console.warn(`[ExerciseAdminService] Processing batch ${batchIdx + 1}/${batches} (${batchCount} exercises)`);
                    // Use the same shared context for all batches
                    const result = await agent.execute({
                        count: batchCount,
                        muscleGroups,
                        equipment,
                        difficulty,
                        variations: variations ?? false,
                        existingExercises: existingNames, // Use current state of existingNames
                        bodyPartIds,
                        exerciseTypeId,
                        description: batchIdx === 0 ? enhancedDescription : undefined, // Only include description with IDs in first batch
                    }, sharedContext);
                    const exercises = (result.output?.exercises || []);
                    generatedCount += exercises.length;
                    onProgress?.(generationStartProgress +
                        ((batchIdx + 1) / batches) * (generationEndProgress - generationStartProgress), `Batch ${batchIdx + 1}/${batches} completato. Generati ${generatedCount}/${count} esercizi finora...`);
                    console.warn(`[ExerciseAdminService] Batch ${batchIdx + 1} completed: ${exercises.length} exercises generated`);
                    return exercises;
                }
                catch (error) {
                    console.error(`[ExerciseAdminService] Error in batch ${batchIdx + 1}:`, error);
                    throw error; // Re-throw to see the error instead of silently catching it
                }
            },
            onGroupComplete: (results) => {
                // Update existing names after group completes (avoid race conditions)
                const newNames = results
                    .map((e) => e.translations.find((t) => t.locale === 'en')?.name || e.slug || '')
                    .filter(Boolean);
                existingNames.push(...newNames);
                console.warn(`[ExerciseAdminService] Group complete: ${newNames.length} new exercise names added`);
            },
            initialState: existingNames,
        });
        console.warn(`[ExerciseAdminService] Generation complete: ${allExercises.length} total exercises`);
        if (allExercises.length === 0) {
            throw new Error('Failed to generate any exercises');
        }
        onProgress?.(validationStartProgress, `Validando ${allExercises.length} esercizi generati...`);
        // Convert to import format with validation and defaults
        let validatedCount = 0;
        const importRecords = allExercises
            .map((exercise) => {
            // Validate required fields
            if (!exercise.translations ||
                !Array.isArray(exercise.translations) ||
                exercise.translations.length === 0) {
                return null;
            }
            if (!exercise.muscles ||
                !Array.isArray(exercise.muscles) ||
                exercise.muscles.length === 0) {
                return null;
            }
            if (!exercise.bodyPartIds ||
                !Array.isArray(exercise.bodyPartIds) ||
                exercise.bodyPartIds.length === 0) {
                return null;
            }
            // Deduplicate translations by locale (keep first occurrence)
            const seenLocales = new Set();
            const uniqueTranslations = exercise.translations.filter((t) => {
                const locale = (t.locale || '').toLowerCase();
                if (!locale || seenLocales.has(locale)) {
                    if (seenLocales.has(locale)) {
                        console.warn(`[ExerciseAdminService] Duplicate translation locale "${locale}" removed for exercise "${exercise.slug}"`);
                    }
                    return false;
                }
                seenLocales.add(locale);
                return true;
            });
            if (uniqueTranslations.length === 0) {
                console.error(`[ExerciseAdminService] No valid translations after deduplication for exercise "${exercise.slug}"`);
                return null;
            }
            // Normalize imageUrl and videoUrl using shared utility
            const record = {
                slug: exercise.slug,
                exerciseTypeId: exercise.exerciseTypeId,
                overview: exercise.overview,
                imageUrl: normalizeUrl(exercise.imageUrl),
                videoUrl: normalizeUrl(exercise.videoUrl),
                keywords: exercise.keywords || [],
                instructions: exercise.instructions || [],
                exerciseTips: exercise.exerciseTips || [],
                variations: exercise.variations || [],
                translations: uniqueTranslations, // Deduplicated translations
                muscles: exercise.muscles.map((m) => ({ id: m.id, role: m.role })), // Already validated above
                bodyPartIds: exercise.bodyPartIds, // Already validated above
                equipmentIds: exercise.equipmentIds || [],
                relatedExercises: [],
                approvalStatus: exercise.approvalStatus || (autoApprove ? 'APPROVED' : 'PENDING'),
                isUserGenerated: false,
            };
            validatedCount++;
            if (validatedCount % 5 === 0) {
                onProgress?.(validationStartProgress +
                    (validatedCount / allExercises.length) *
                        (validationEndProgress - validationStartProgress), `Validati ${validatedCount}/${allExercises.length} esercizi...`);
            }
            return record;
        })
            .filter((record) => {
            if (record === null)
                return false;
            // Type guard: ensure record has required fields
            return !!record.slug && !!record.translations && !!record.muscles && !!record.bodyPartIds;
        });
        if (importRecords.length === 0) {
            throw new Error('No valid exercises generated (missing required fields: translations, muscles, or bodyPartIds)');
        }
        onProgress?.(validationEndProgress, `${importRecords.length} esercizi validati. Iniziando import nel database...`);
        console.warn(`[ExerciseAdminService] Starting import of ${importRecords.length} exercises`);
        // Import exercises with shared context to avoid duplicate metadata creation
        const importResult = await this.import(importRecords, {
            userId,
            autoApprove,
            mergeExisting,
            sharedContext: {
                metadata: {
                    createdExerciseTypes: sharedContext.metadata.createdExerciseTypes,
                },
            },
            onProgress: (current, total) => {
                const progress = importStartProgress + (current / total) * (importEndProgress - importStartProgress);
                onProgress?.(progress, `Importati ${current}/${total} esercizi nel database...`);
            },
        });
        onProgress?.(importEndProgress, `Completato! ${importResult.created} creati, ${importResult.updatedItems.length} aggiornati, ${importResult.skippedSlugs.length} saltati.`);
        console.warn(`[ExerciseAdminService] Import complete: ${importResult.created} created, ${importResult.updated} updated, ${importResult.skipped} skipped`);
        return importResult;
    }
    /**
     * Genera piano AI utilizzando modello predefinito
     */
    static async generateAiPlan(prompt) {
        const basePrompt = prompt.trim();
        if (!basePrompt) {
            throw new Error('Il prompt non può essere vuoto');
        }
        // Fetch available metadata IDs to include in prompt
        const metadata = await getAllMetadataForLocale('en');
        // Validate that we have metadata
        if (!metadata.muscles || metadata.muscles.length === 0) {
            throw new Error('No muscles found in database. Please run database seed: pnpm db:seed or pnpm db:reset');
        }
        if (!metadata.bodyParts || metadata.bodyParts.length === 0) {
            throw new Error('No body parts found in database. Please run database seed: pnpm db:seed or pnpm db:reset');
        }
        // Build ID maps for AI (ID → English name for reasoning)
        const muscleIdMap = metadata.muscles.map((m) => `${m.id}: ${m.name}`).join(', ');
        const bodyPartIdMap = metadata.bodyParts.map((bp) => `${bp.id}: ${bp.name}`).join(', ');
        const equipmentIdMap = metadata.equipment.map((e) => `${e.id}: ${e.name}`).join(', ');
        const exerciseTypeIdMap = metadata.exerciseTypes
            .map((et) => `${et.id}: ${et.name}`)
            .join(', ');
        const modelConfig = await getModelByTier('balanced');
        const apiKey = await AIProviderConfigService.getApiKey(modelConfig.provider);
        if (!apiKey) {
            throw new Error(`API key non configurata per il provider ${modelConfig.provider}`);
        }
        // Use centralized model creation with custom config
        const model = createCustomModel(modelConfig, {
            maxTokens: TOKEN_LIMITS.DEFAULT_MAX_TOKENS,
            temperature: MODEL_CONSTANTS.INTENT_DETECTION_TEMPERATURE,
        }, apiKey);
        // Build prompt with available IDs
        const enhancedPrompt = `User request:\n${basePrompt}

AVAILABLE METADATA IDs (use these IDs in your response, NOT names):
- Muscles (ID: English Name): ${muscleIdMap || 'None available - database needs seeding'}
- Body Parts (ID: English Name): ${bodyPartIdMap || 'None available - database needs seeding'}
- Equipment (ID: English Name): ${equipmentIdMap || 'None available - database needs seeding'}
- Exercise Types (ID: English Name): ${exerciseTypeIdMap || 'None available - database needs seeding'}

CRITICAL: 
- Use ONLY the IDs listed above. Do NOT invent IDs or use names.
- If any metadata list shows "None available", you MUST return an empty "create" array and explain in the "summary" field that metadata is missing and the database needs to be seeded.
- Do NOT create exercises if you don't have valid muscle IDs and body part IDs to use.`;
        // Use streamText + output (AI SDK 6 native) for structured output
        try {
            const result = await streamText({
                model,
                system: EXERCISE_AI_SYSTEM_PROMPT,
                prompt: enhancedPrompt,
                output: Output.object({
                    schema: exerciseAiPlanSchema,
                }),
                temperature: 0.3,
                maxOutputTokens: TOKEN_LIMITS.DEFAULT_MAX_TOKENS,
                // Per structured output con streamText, serve stopWhen
                // La documentazione dice: "you must configure multiple steps with stopWhen because
                // generating the structured output is itself a step"
                stopWhen: stepCountIs(2),
            });
            // When using Output.object, use result.object instead of result.text
            // Following: https://v6.ai-sdk.dev/docs/announcing-ai-sdk-6-beta#structured-output-stable
            // result.object may be a Promise, so we await it
            const resultWithObject = result;
            let structuredObject = null;
            if (resultWithObject.object) {
                if (resultWithObject.object instanceof Promise) {
                    structuredObject = await resultWithObject.object;
                }
                else if (typeof resultWithObject.object === 'object' &&
                    resultWithObject.object !== null &&
                    'then' in resultWithObject.object &&
                    typeof resultWithObject.object.then === 'function') {
                    structuredObject = await resultWithObject.object;
                }
                else {
                    structuredObject = resultWithObject.object;
                }
            }
            if (!structuredObject) {
                // Fallback: try to parse from text if object is null
                const fullText = await result.text;
                if (!fullText) {
                    throw new Error('Failed to generate structured output: both object and text are null');
                }
                // Parse JSON from text as fallback
                const parsed = parseJsonResponse(fullText);
                if (!parsed) {
                    throw new Error('Failed to parse JSON from AI response text');
                }
                // Validate and return typed object
                return exerciseAiPlanSchema.parse(parsed);
            }
            // Validate and return typed object (already structured, but validate with schema)
            return exerciseAiPlanSchema.parse(structuredObject);
        }
        catch (error) {
            throw error;
        }
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
