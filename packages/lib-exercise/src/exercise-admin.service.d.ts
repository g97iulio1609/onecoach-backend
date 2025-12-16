/**
 * Exercise Admin Service
 *
 * Utility dedicate alla gestione avanzata del catalogo esercizi:
 * - Import/export in formato JSON con deduplica
 * - Operazioni batch (CRUD) e automazioni AI
 */
import { type CreateExerciseInput, type ExerciseRelationInput } from '@onecoach/schemas';
import { z } from 'zod';
type ExerciseApprovalStatus = 'APPROVED' | 'PENDING';
type ExerciseRelationType = NonNullable<ExerciseRelationInput['relation']>;
type MuscleRole = NonNullable<CreateExerciseInput['muscles']>[number]['role'];
export declare const exerciseImportSchema: z.ZodIntersection<z.ZodObject<{
    slug: z.ZodOptional<z.ZodString>;
    exerciseTypeId: z.ZodString;
    overview: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodPipe<z.ZodTransform<{} | undefined, unknown>, z.ZodOptional<z.ZodURL>>>;
    videoUrl: z.ZodOptional<z.ZodPipe<z.ZodTransform<{} | undefined, unknown>, z.ZodOptional<z.ZodURL>>>;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString>>;
    instructions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    exerciseTips: z.ZodOptional<z.ZodArray<z.ZodString>>;
    variations: z.ZodOptional<z.ZodArray<z.ZodString>>;
    translations: z.ZodArray<z.ZodObject<{
        locale: z.ZodString;
        name: z.ZodString;
        shortName: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        searchTerms: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    muscles: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        role: z.ZodEnum<{
            PRIMARY: "PRIMARY";
            SECONDARY: "SECONDARY";
        }>;
    }, z.core.$strip>>;
    bodyPartIds: z.ZodArray<z.ZodString>;
    equipmentIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    relatedExercises: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        relation: z.ZodEnum<{
            ALTERNATIVE: "ALTERNATIVE";
            COMPLEMENTARY: "COMPLEMENTARY";
            PROGRESSION: "PROGRESSION";
        }>;
        direction: z.ZodDefault<z.ZodEnum<{
            outbound: "outbound";
            bidirectional: "bidirectional";
        }>>;
    }, z.core.$strip>>>;
    isUserGenerated: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    approvalStatus: z.ZodOptional<z.ZodEnum<{
        APPROVED: "APPROVED";
        PENDING: "PENDING";
    }>>;
}, z.core.$strip>>;
/**
 * Schema per piano AI (CRUD batch)
 */
export declare const exerciseAiPlanSchema: z.ZodObject<{
    create: z.ZodDefault<z.ZodArray<z.ZodIntersection<z.ZodObject<{
        slug: z.ZodOptional<z.ZodString>;
        exerciseTypeId: z.ZodString;
        overview: z.ZodOptional<z.ZodString>;
        imageUrl: z.ZodOptional<z.ZodPipe<z.ZodTransform<{} | undefined, unknown>, z.ZodOptional<z.ZodURL>>>;
        videoUrl: z.ZodOptional<z.ZodPipe<z.ZodTransform<{} | undefined, unknown>, z.ZodOptional<z.ZodURL>>>;
        keywords: z.ZodOptional<z.ZodArray<z.ZodString>>;
        instructions: z.ZodOptional<z.ZodArray<z.ZodString>>;
        exerciseTips: z.ZodOptional<z.ZodArray<z.ZodString>>;
        variations: z.ZodOptional<z.ZodArray<z.ZodString>>;
        translations: z.ZodArray<z.ZodObject<{
            locale: z.ZodString;
            name: z.ZodString;
            shortName: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            searchTerms: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        muscles: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            role: z.ZodEnum<{
                PRIMARY: "PRIMARY";
                SECONDARY: "SECONDARY";
            }>;
        }, z.core.$strip>>;
        bodyPartIds: z.ZodArray<z.ZodString>;
        equipmentIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        relatedExercises: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            relation: z.ZodEnum<{
                ALTERNATIVE: "ALTERNATIVE";
                COMPLEMENTARY: "COMPLEMENTARY";
                PROGRESSION: "PROGRESSION";
            }>;
            direction: z.ZodDefault<z.ZodEnum<{
                outbound: "outbound";
                bidirectional: "bidirectional";
            }>>;
        }, z.core.$strip>>>;
        isUserGenerated: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>, z.ZodObject<{
        approvalStatus: z.ZodOptional<z.ZodEnum<{
            APPROVED: "APPROVED";
            PENDING: "PENDING";
        }>>;
    }, z.core.$strip>>>>;
    update: z.ZodDefault<z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        data: z.ZodObject<{
            slug: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            exerciseTypeId: z.ZodOptional<z.ZodString>;
            overview: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            imageUrl: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodTransform<{} | undefined, unknown>, z.ZodOptional<z.ZodURL>>>>;
            videoUrl: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodTransform<{} | undefined, unknown>, z.ZodOptional<z.ZodURL>>>>;
            keywords: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
            instructions: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
            exerciseTips: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
            variations: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
            translations: z.ZodOptional<z.ZodArray<z.ZodObject<{
                locale: z.ZodString;
                name: z.ZodString;
                shortName: z.ZodOptional<z.ZodString>;
                description: z.ZodOptional<z.ZodString>;
                searchTerms: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>>;
            muscles: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                role: z.ZodEnum<{
                    PRIMARY: "PRIMARY";
                    SECONDARY: "SECONDARY";
                }>;
            }, z.core.$strip>>>;
            bodyPartIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
            equipmentIds: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
            relatedExercises: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                relation: z.ZodEnum<{
                    ALTERNATIVE: "ALTERNATIVE";
                    COMPLEMENTARY: "COMPLEMENTARY";
                    PROGRESSION: "PROGRESSION";
                }>;
                direction: z.ZodDefault<z.ZodEnum<{
                    outbound: "outbound";
                    bidirectional: "bidirectional";
                }>>;
            }, z.core.$strip>>>>;
            isUserGenerated: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
            approvalStatus: z.ZodOptional<z.ZodEnum<{
                DRAFT: "DRAFT";
                PENDING: "PENDING";
                APPROVED: "APPROVED";
                REJECTED: "REJECTED";
            }>>;
        }, z.core.$strip>;
    }, z.core.$strip>>>;
    delete: z.ZodDefault<z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strip>>>;
    approve: z.ZodDefault<z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        status: z.ZodDefault<z.ZodEnum<{
            APPROVED: "APPROVED";
            PENDING: "PENDING";
        }>>;
    }, z.core.$strip>>>;
    summary: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ExerciseImportPayload = z.infer<typeof exerciseImportSchema>;
type ExerciseAiPlan = z.infer<typeof exerciseAiPlanSchema>;
export interface ExerciseExportRecord {
    id: string;
    slug: string;
    approvalStatus: ExerciseApprovalStatus;
    approvedAt: string | null;
    version: number;
    isUserGenerated: boolean;
    createdAt: string;
    updatedAt: string;
    exerciseTypeId: string | null;
    overview: string | null;
    imageUrl: string | null;
    videoUrl: string | null;
    keywords: string[];
    instructions: string[];
    exerciseTips: string[];
    variations: string[];
    translations: Array<{
        locale: string;
        name: string;
        shortName: string | null;
        description: string | null;
        searchTerms: string[];
    }>;
    muscles: Array<{
        id: string;
        role: MuscleRole;
    }>;
    bodyPartIds: string[];
    equipmentIds: string[];
    relatedExercises: Array<{
        id: string;
        relation: ExerciseRelationType;
        direction: 'outbound' | 'bidirectional';
    }>;
}
export interface ExerciseImportResult {
    created: number;
    updated: number;
    skipped: number;
    createdItems: Array<{
        id: string;
        slug: string;
    }>;
    updatedItems: Array<{
        id: string;
        slug: string;
    }>;
    skippedSlugs: string[];
    errors: Array<{
        slug: string;
        reason: string;
    }>;
}
export interface ExerciseAiExecutionResult {
    summary?: string;
    createResult: ExerciseImportResult | null;
    updateResult: Array<{
        slug: string;
        success: boolean;
        error?: string;
    }>;
    deleteResult: Array<{
        slug: string;
        success: boolean;
        error?: string;
    }>;
    approvalResult: Array<{
        slug: string;
        status: ExerciseApprovalStatus;
        success: boolean;
        error?: string;
    }>;
    plan: ExerciseAiPlan;
}
interface ImportOptions {
    userId?: string;
    autoApprove?: boolean;
    mergeExisting?: boolean;
    sharedContext?: {
        metadata?: {
            createdExerciseTypes?: Record<string, string>;
        };
    };
    onProgress?: (current: number, total: number) => void;
}
interface AiPlanOptions extends ImportOptions {
    prompt: string;
}
export declare class ExerciseAdminService {
    /**
     * Esporta l'intero catalogo esercizi (opzionalmente includendo quelli non approvati)
     */
    static exportAll(options?: {
        includeUnapproved?: boolean;
    }): Promise<ExerciseExportRecord[]>;
    /**
     * Importa esercizi evitando duplicati (basato su slug) con supporto merge
     */
    static import(records: ExerciseImportPayload[], options?: ImportOptions): Promise<ExerciseImportResult>;
    /**
     * Esegue un piano di operazioni generato via AI (create/update/delete/approve)
     */
    static executeAiPlan(options: AiPlanOptions): Promise<ExerciseAiExecutionResult>;
    /**
     * Generate exercises using ExerciseGenerationAgent (OneAgent SDK 2.5)
     * Uses parallel batch processing for better performance
     */
    static generateExercisesWithAgent(options: {
        count: number;
        muscleGroups?: string[];
        equipment?: string[];
        difficulty?: 'beginner' | 'intermediate' | 'advanced';
        variations?: boolean;
        bodyPartIds?: string[];
        exerciseTypeId?: string;
        description?: string;
        existingExercises?: string[];
        userId?: string;
        autoApprove?: boolean;
        mergeExisting?: boolean;
        onProgress?: (progress: number, message: string) => void;
    }): Promise<ExerciseImportResult>;
    /**
     * Genera piano AI utilizzando modello predefinito
     */
    private static generateAiPlan;
    /**
     * Normalizza payload di import generando slug e campi coerenti
     */
    private static normalizeImportRecord;
    /**
     * Risolve le relazioni basate su slug → ID
     */
    private static resolveRelations;
    /**
     * Unisce relazioni rimuovendo duplicati
     */
    private static mergeRelations;
    /**
     * Mappa esercizio (con relazioni) in record esportabile
     */
    private static formatExportRecord;
}
export {};
//# sourceMappingURL=exercise-admin.service.d.ts.map