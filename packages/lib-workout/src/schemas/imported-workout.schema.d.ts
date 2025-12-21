/**
 * Imported Workout Schema
 *
 * Schema Zod intermedio per parsing file di workout.
 * Questo schema normalizza i dati da qualsiasi formato (XLSX, CSV, DOCX, immagini)
 * in una struttura uniforme prima della conversione in WorkoutProgram.
 *
 * @module lib-workout/schemas/imported-workout
 */
import { z } from 'zod';
/**
 * Schema per una singola serie importata (formato semplificato)
 */
export declare const ImportedSetSchema: z.ZodObject<{
    reps: z.ZodOptional<z.ZodNumber>;
    repsMin: z.ZodOptional<z.ZodNumber>;
    repsMax: z.ZodOptional<z.ZodNumber>;
    duration: z.ZodOptional<z.ZodNumber>;
    weight: z.ZodOptional<z.ZodNumber>;
    weightMin: z.ZodOptional<z.ZodNumber>;
    weightMax: z.ZodOptional<z.ZodNumber>;
    rest: z.ZodOptional<z.ZodNumber>;
    rpe: z.ZodOptional<z.ZodNumber>;
    intensityPercent: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ImportedSet = z.infer<typeof ImportedSetSchema>;
/**
 * Schema per un esercizio importato
 * Formato semplificato per facilitare il parsing AI
 */
export declare const ImportedExerciseSchema: z.ZodObject<{
    name: z.ZodString;
    variant: z.ZodOptional<z.ZodString>;
    catalogExerciseId: z.ZodOptional<z.ZodString>;
    matchConfidence: z.ZodOptional<z.ZodNumber>;
    notFound: z.ZodOptional<z.ZodBoolean>;
    group: z.ZodOptional<z.ZodString>;
    setsNotation: z.ZodOptional<z.ZodString>;
    sets: z.ZodOptional<z.ZodNumber>;
    reps: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
    weight: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
    rest: z.ZodOptional<z.ZodNumber>;
    rpe: z.ZodOptional<z.ZodNumber>;
    intensityPercent: z.ZodOptional<z.ZodNumber>;
    tempo: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    detailedSets: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reps: z.ZodOptional<z.ZodNumber>;
        repsMin: z.ZodOptional<z.ZodNumber>;
        repsMax: z.ZodOptional<z.ZodNumber>;
        duration: z.ZodOptional<z.ZodNumber>;
        weight: z.ZodOptional<z.ZodNumber>;
        weightMin: z.ZodOptional<z.ZodNumber>;
        weightMax: z.ZodOptional<z.ZodNumber>;
        rest: z.ZodOptional<z.ZodNumber>;
        rpe: z.ZodOptional<z.ZodNumber>;
        intensityPercent: z.ZodOptional<z.ZodNumber>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    equipment: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type ImportedExercise = z.infer<typeof ImportedExerciseSchema>;
/**
 * Schema per un giorno di allenamento importato
 */
export declare const ImportedDaySchema: z.ZodObject<{
    dayNumber: z.ZodNumber;
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    targetMuscles: z.ZodOptional<z.ZodArray<z.ZodString>>;
    exercises: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        variant: z.ZodOptional<z.ZodString>;
        catalogExerciseId: z.ZodOptional<z.ZodString>;
        matchConfidence: z.ZodOptional<z.ZodNumber>;
        notFound: z.ZodOptional<z.ZodBoolean>;
        group: z.ZodOptional<z.ZodString>;
        setsNotation: z.ZodOptional<z.ZodString>;
        sets: z.ZodOptional<z.ZodNumber>;
        reps: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
        weight: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
        rest: z.ZodOptional<z.ZodNumber>;
        rpe: z.ZodOptional<z.ZodNumber>;
        intensityPercent: z.ZodOptional<z.ZodNumber>;
        tempo: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        detailedSets: z.ZodOptional<z.ZodArray<z.ZodObject<{
            reps: z.ZodOptional<z.ZodNumber>;
            repsMin: z.ZodOptional<z.ZodNumber>;
            repsMax: z.ZodOptional<z.ZodNumber>;
            duration: z.ZodOptional<z.ZodNumber>;
            weight: z.ZodOptional<z.ZodNumber>;
            weightMin: z.ZodOptional<z.ZodNumber>;
            weightMax: z.ZodOptional<z.ZodNumber>;
            rest: z.ZodOptional<z.ZodNumber>;
            rpe: z.ZodOptional<z.ZodNumber>;
            intensityPercent: z.ZodOptional<z.ZodNumber>;
            notes: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        equipment: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    notes: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    warmup: z.ZodOptional<z.ZodString>;
    cooldown: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ImportedDay = z.infer<typeof ImportedDaySchema>;
/**
 * Schema per una settimana importata
 */
export declare const ImportedWeekSchema: z.ZodObject<{
    weekNumber: z.ZodNumber;
    name: z.ZodOptional<z.ZodString>;
    focus: z.ZodOptional<z.ZodString>;
    days: z.ZodArray<z.ZodObject<{
        dayNumber: z.ZodNumber;
        name: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
        targetMuscles: z.ZodOptional<z.ZodArray<z.ZodString>>;
        exercises: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            variant: z.ZodOptional<z.ZodString>;
            catalogExerciseId: z.ZodOptional<z.ZodString>;
            matchConfidence: z.ZodOptional<z.ZodNumber>;
            notFound: z.ZodOptional<z.ZodBoolean>;
            group: z.ZodOptional<z.ZodString>;
            setsNotation: z.ZodOptional<z.ZodString>;
            sets: z.ZodOptional<z.ZodNumber>;
            reps: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
            weight: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
            rest: z.ZodOptional<z.ZodNumber>;
            rpe: z.ZodOptional<z.ZodNumber>;
            intensityPercent: z.ZodOptional<z.ZodNumber>;
            tempo: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
            detailedSets: z.ZodOptional<z.ZodArray<z.ZodObject<{
                reps: z.ZodOptional<z.ZodNumber>;
                repsMin: z.ZodOptional<z.ZodNumber>;
                repsMax: z.ZodOptional<z.ZodNumber>;
                duration: z.ZodOptional<z.ZodNumber>;
                weight: z.ZodOptional<z.ZodNumber>;
                weightMin: z.ZodOptional<z.ZodNumber>;
                weightMax: z.ZodOptional<z.ZodNumber>;
                rest: z.ZodOptional<z.ZodNumber>;
                rpe: z.ZodOptional<z.ZodNumber>;
                intensityPercent: z.ZodOptional<z.ZodNumber>;
                notes: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>;
            equipment: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        notes: z.ZodOptional<z.ZodString>;
        duration: z.ZodOptional<z.ZodNumber>;
        warmup: z.ZodOptional<z.ZodString>;
        cooldown: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ImportedWeek = z.infer<typeof ImportedWeekSchema>;
/**
 * Schema principale per un programma importato
 */
export declare const ImportedWorkoutProgramSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodString>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    difficulty: z.ZodOptional<z.ZodEnum<{
        BEGINNER: "BEGINNER";
        INTERMEDIATE: "INTERMEDIATE";
        ADVANCED: "ADVANCED";
        EXPERT: "EXPERT";
    }>>;
    durationWeeks: z.ZodOptional<z.ZodNumber>;
    goals: z.ZodOptional<z.ZodArray<z.ZodString>>;
    programType: z.ZodOptional<z.ZodString>;
    weeks: z.ZodArray<z.ZodObject<{
        weekNumber: z.ZodNumber;
        name: z.ZodOptional<z.ZodString>;
        focus: z.ZodOptional<z.ZodString>;
        days: z.ZodArray<z.ZodObject<{
            dayNumber: z.ZodNumber;
            name: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodString>;
            targetMuscles: z.ZodOptional<z.ZodArray<z.ZodString>>;
            exercises: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                variant: z.ZodOptional<z.ZodString>;
                catalogExerciseId: z.ZodOptional<z.ZodString>;
                matchConfidence: z.ZodOptional<z.ZodNumber>;
                notFound: z.ZodOptional<z.ZodBoolean>;
                group: z.ZodOptional<z.ZodString>;
                setsNotation: z.ZodOptional<z.ZodString>;
                sets: z.ZodOptional<z.ZodNumber>;
                reps: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
                weight: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
                rest: z.ZodOptional<z.ZodNumber>;
                rpe: z.ZodOptional<z.ZodNumber>;
                intensityPercent: z.ZodOptional<z.ZodNumber>;
                tempo: z.ZodOptional<z.ZodString>;
                notes: z.ZodOptional<z.ZodString>;
                detailedSets: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    reps: z.ZodOptional<z.ZodNumber>;
                    repsMin: z.ZodOptional<z.ZodNumber>;
                    repsMax: z.ZodOptional<z.ZodNumber>;
                    duration: z.ZodOptional<z.ZodNumber>;
                    weight: z.ZodOptional<z.ZodNumber>;
                    weightMin: z.ZodOptional<z.ZodNumber>;
                    weightMax: z.ZodOptional<z.ZodNumber>;
                    rest: z.ZodOptional<z.ZodNumber>;
                    rpe: z.ZodOptional<z.ZodNumber>;
                    intensityPercent: z.ZodOptional<z.ZodNumber>;
                    notes: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>>;
                equipment: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            notes: z.ZodOptional<z.ZodString>;
            duration: z.ZodOptional<z.ZodNumber>;
            warmup: z.ZodOptional<z.ZodString>;
            cooldown: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    originalAuthor: z.ZodOptional<z.ZodString>;
    sourceFile: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export type ImportedWorkoutProgram = z.infer<typeof ImportedWorkoutProgramSchema>;
/**
 * Schema per il risultato del parsing
 */
export declare const ParseResultSchema: z.ZodObject<{
    program: z.ZodObject<{
        id: z.ZodDefault<z.ZodString>;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        difficulty: z.ZodOptional<z.ZodEnum<{
            BEGINNER: "BEGINNER";
            INTERMEDIATE: "INTERMEDIATE";
            ADVANCED: "ADVANCED";
            EXPERT: "EXPERT";
        }>>;
        durationWeeks: z.ZodOptional<z.ZodNumber>;
        goals: z.ZodOptional<z.ZodArray<z.ZodString>>;
        programType: z.ZodOptional<z.ZodString>;
        weeks: z.ZodArray<z.ZodObject<{
            weekNumber: z.ZodNumber;
            name: z.ZodOptional<z.ZodString>;
            focus: z.ZodOptional<z.ZodString>;
            days: z.ZodArray<z.ZodObject<{
                dayNumber: z.ZodNumber;
                name: z.ZodOptional<z.ZodString>;
                type: z.ZodOptional<z.ZodString>;
                targetMuscles: z.ZodOptional<z.ZodArray<z.ZodString>>;
                exercises: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    variant: z.ZodOptional<z.ZodString>;
                    catalogExerciseId: z.ZodOptional<z.ZodString>;
                    matchConfidence: z.ZodOptional<z.ZodNumber>;
                    notFound: z.ZodOptional<z.ZodBoolean>;
                    group: z.ZodOptional<z.ZodString>;
                    setsNotation: z.ZodOptional<z.ZodString>;
                    sets: z.ZodOptional<z.ZodNumber>;
                    reps: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
                    weight: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
                    rest: z.ZodOptional<z.ZodNumber>;
                    rpe: z.ZodOptional<z.ZodNumber>;
                    intensityPercent: z.ZodOptional<z.ZodNumber>;
                    tempo: z.ZodOptional<z.ZodString>;
                    notes: z.ZodOptional<z.ZodString>;
                    detailedSets: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        reps: z.ZodOptional<z.ZodNumber>;
                        repsMin: z.ZodOptional<z.ZodNumber>;
                        repsMax: z.ZodOptional<z.ZodNumber>;
                        duration: z.ZodOptional<z.ZodNumber>;
                        weight: z.ZodOptional<z.ZodNumber>;
                        weightMin: z.ZodOptional<z.ZodNumber>;
                        weightMax: z.ZodOptional<z.ZodNumber>;
                        rest: z.ZodOptional<z.ZodNumber>;
                        rpe: z.ZodOptional<z.ZodNumber>;
                        intensityPercent: z.ZodOptional<z.ZodNumber>;
                        notes: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>>>;
                    equipment: z.ZodOptional<z.ZodArray<z.ZodString>>;
                }, z.core.$strip>>;
                notes: z.ZodOptional<z.ZodString>;
                duration: z.ZodOptional<z.ZodNumber>;
                warmup: z.ZodOptional<z.ZodString>;
                cooldown: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            notes: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        originalAuthor: z.ZodOptional<z.ZodString>;
        sourceFile: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strip>;
    warnings: z.ZodArray<z.ZodString>;
    unmatchedExercises: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        weekNumber: z.ZodNumber;
        dayNumber: z.ZodNumber;
        suggestions: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            confidence: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    stats: z.ZodObject<{
        totalWeeks: z.ZodNumber;
        totalDays: z.ZodNumber;
        totalExercises: z.ZodNumber;
        matchedExercises: z.ZodNumber;
        unmatchedExercises: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ParseResult = z.infer<typeof ParseResultSchema>;
/**
 * Schema per le opzioni di import
 */
export declare const ImportOptionsSchema: z.ZodObject<{
    mode: z.ZodDefault<z.ZodEnum<{
        auto: "auto";
        review: "review";
    }>>;
    createMissingExercises: z.ZodDefault<z.ZodBoolean>;
    matchThreshold: z.ZodDefault<z.ZodNumber>;
    locale: z.ZodDefault<z.ZodString>;
    preserveProgressions: z.ZodDefault<z.ZodBoolean>;
    normalizeWeights: z.ZodDefault<z.ZodBoolean>;
    sourceWeightUnit: z.ZodDefault<z.ZodEnum<{
        kg: "kg";
        lbs: "lbs";
    }>>;
}, z.core.$strip>;
export type ImportOptions = z.infer<typeof ImportOptionsSchema>;
/**
 * Schema per un file da importare
 * NOTA: Schema flessibile - l'AI interpreterà qualsiasi contenuto
 */
export declare const ImportFileSchema: z.ZodObject<{
    name: z.ZodString;
    mimeType: z.ZodOptional<z.ZodString>;
    content: z.ZodString;
    size: z.ZodOptional<z.ZodNumber>;
    sheetIndex: z.ZodOptional<z.ZodNumber>;
    sheetName: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ImportFile = z.infer<typeof ImportFileSchema>;
/**
 * Schema per la richiesta di import completa
 */
export declare const ImportRequestSchema: z.ZodObject<{
    files: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        mimeType: z.ZodOptional<z.ZodString>;
        content: z.ZodString;
        size: z.ZodOptional<z.ZodNumber>;
        sheetIndex: z.ZodOptional<z.ZodNumber>;
        sheetName: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    options: z.ZodOptional<z.ZodObject<{
        mode: z.ZodDefault<z.ZodEnum<{
            auto: "auto";
            review: "review";
        }>>;
        createMissingExercises: z.ZodDefault<z.ZodBoolean>;
        matchThreshold: z.ZodDefault<z.ZodNumber>;
        locale: z.ZodDefault<z.ZodString>;
        preserveProgressions: z.ZodDefault<z.ZodBoolean>;
        normalizeWeights: z.ZodDefault<z.ZodBoolean>;
        sourceWeightUnit: z.ZodDefault<z.ZodEnum<{
            kg: "kg";
            lbs: "lbs";
        }>>;
    }, z.core.$strip>>;
    userId: z.ZodString;
}, z.core.$strip>;
export type ImportRequest = z.infer<typeof ImportRequestSchema>;
/**
 * MIME types supportati
 */
export declare const SUPPORTED_MIME_TYPES: {
    readonly 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': "xlsx";
    readonly 'application/vnd.ms-excel': "xls";
    readonly 'text/csv': "csv";
    readonly 'application/vnd.oasis.opendocument.spreadsheet': "ods";
    readonly 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': "docx";
    readonly 'application/msword': "doc";
    readonly 'application/vnd.oasis.opendocument.text': "odt";
    readonly 'application/pdf': "pdf";
    readonly 'image/jpeg': "jpg";
    readonly 'image/png': "png";
    readonly 'image/webp': "webp";
    readonly 'image/heic': "heic";
    readonly 'image/heif': "heif";
};
export type SupportedMimeType = keyof typeof SUPPORTED_MIME_TYPES;
/**
 * Estensioni file supportate
 */
export declare const SUPPORTED_EXTENSIONS: readonly [".xlsx", ".xls", ".csv", ".ods", ".docx", ".doc", ".odt", ".pdf", ".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
export type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];
/**
 * Limiti di default per l'import
 */
export declare const IMPORT_LIMITS: {
    /** Dimensione massima file singolo in bytes (10MB) */
    readonly MAX_FILE_SIZE: number;
    /** Numero massimo di file per import */
    readonly MAX_FILES: 10;
    /** Costo in crediti per import */
    readonly DEFAULT_CREDIT_COST: 10;
    /** Rate limit: max import per ora */
    readonly RATE_LIMIT_PER_HOUR: 5;
};
