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
type ParsedWorkoutData = {
    combinedProgram: ImportedWorkoutProgram;
    warnings: string[];
    errors: string[];
    stats: {
        filesProcessed: number;
        parsingWarnings: number;
        parsingErrors: number;
    };
};
/**
 * Workout Import Service
 */
export declare class WorkoutImportService extends BaseImportService<ParsedWorkoutData, WorkoutImportResult> {
    protected getLoggerName(): string;
    protected validateFiles(files: ImportFile[]): void;
    protected parseFiles(files: ImportFile[], options?: Partial<ImportOptions>): Promise<ParsedWorkoutData>;
    protected buildPrompt(_options?: Partial<ImportOptions>): string;
    protected processParsed(parsed: ParsedWorkoutData, userId: string, options?: Partial<ImportOptions>): Promise<any>;
    protected persist(processed: any, userId: string): Promise<Partial<WorkoutImportResult>>;
    protected createErrorResult(errors: string[]): Partial<WorkoutImportResult>;
    private convert;
    private convertWeek;
    private convertDay;
    private convertExercise;
}
export {};
