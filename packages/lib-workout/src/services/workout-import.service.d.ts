import type { WorkoutProgram } from '@onecoach/types';
import type { ImportFile, ImportedWorkoutProgram, ImportOptions } from '../schemas/imported-workout.schema';
import type { BaseImportResult } from '@onecoach/lib-import-core';
import { BaseImportService } from '@onecoach/lib-import-core';
/**
 * Risultato dell'import
 */
export interface WorkoutImportResult extends BaseImportResult {
    program?: WorkoutProgram;
    programId?: string;
    stats?: {
        filesProcessed: number;
        exercisesTotal: number;
        exercisesMatched: number;
        exercisesCreated: number;
        weeksImported: number;
        daysImported: number;
        creditsUsed: number;
    };
    parseResult?: any;
}
/**
 * Configurazione import (da admin settings)
 */
export interface ImportConfig {
    maxFileSizeMB: number;
    maxFiles: number;
    creditCost: number;
    rateLimit: number;
    enableSupabaseStorage: boolean;
    defaultMode: 'auto' | 'review';
    matchThreshold: number;
}
/**
 * Internal type for parsed workout data after processing.
 * Contains both raw imported program and converted workout program.
 */
type ParsedWorkoutData = {
    /** Raw imported program from AI */
    combinedProgram: ImportedWorkoutProgram;
    /** Converted workout program for persistence */
    workoutProgram?: WorkoutProgram;
    /** Parsing warnings */
    warnings: string[];
    /** Parsing errors */
    errors: string[];
    /** Parsing stats */
    stats: {
        filesProcessed: number;
        parsingWarnings: number;
        parsingErrors: number;
    };
    /** Import stats (set after processing) */
    importStats?: {
        exercisesTotal: number;
        exercisesMatched: number;
        exercisesCreated: number;
        weeksImported: number;
        daysImported: number;
        creditsUsed: number;
    };
    /** Flag for review mode */
    needsReview?: boolean;
    /** Parse result for review */
    parseResult?: any;
};
/**
 * Workout Import Service
 *
 * Extends BaseImportService with:
 * - TAIRaw = ImportedWorkoutProgram (what AI returns)
 * - TParsed = ParsedWorkoutData (wrapped with warnings/stats)
 * - TResult = WorkoutImportResult
 */
export declare class WorkoutImportService extends BaseImportService<ImportedWorkoutProgram, ParsedWorkoutData, WorkoutImportResult> {
    protected getLoggerName(): string;
    protected validateFiles(files: ImportFile[]): void;
    private parsingWarnings;
    private parsingErrors;
    private parsingStats;
    protected parseFiles(files: ImportFile[], options?: Partial<ImportOptions>): Promise<ImportedWorkoutProgram>;
    protected buildPrompt(_options?: Partial<ImportOptions>): string;
    protected processParsed(parsed: ImportedWorkoutProgram, // TAIRaw - raw AI output
    userId: string, options?: Partial<ImportOptions>): Promise<ParsedWorkoutData>;
    protected persist(processed: any, userId: string): Promise<Partial<WorkoutImportResult>>;
    protected createErrorResult(errors: string[]): Partial<WorkoutImportResult>;
    private convert;
    private convertWeek;
    private convertDay;
    private convertExercise;
}
export {};
//# sourceMappingURL=workout-import.service.d.ts.map