import type { AIParseContext } from '@onecoach/lib-import-core';
import { type ImportFile, type ImportedWorkoutProgram, type ImportOptions } from '../schemas/imported-workout.schema';
/**
 * Risultato del parsing di un singolo file
 */
export interface FileParseResult {
    /** Successo del parsing */
    success: boolean;
    /** Programma parsato (se successo) */
    program?: ImportedWorkoutProgram;
    /** Errore (se fallito) */
    error?: string;
    /** Warnings durante il parsing */
    warnings: string[];
    /** Tipo di file parsato */
    fileType: string;
    /** Nome del file */
    fileName: string;
}
/**
 * File Parser Service
 */
export declare class FileParserService {
    /**
     * Parsa un file Excel/CSV
     */
    static parseSpreadsheet(file: ImportFile, options: ImportOptions): Promise<FileParseResult>;
    /**
     * Parsa un file CSV
     */
    static parseCSV(file: ImportFile, options: ImportOptions): Promise<FileParseResult>;
    /**
     * Estrae testo da un documento Word
     * Richiede mammoth library (da installare)
     */
    static parseDocument(file: ImportFile, _options: ImportOptions, aiContext?: AIParseContext): Promise<FileParseResult>;
    /**
     * Parsa un'immagine usando Vision AI
     */
    static parseImage(file: ImportFile, _options: ImportOptions, aiContext?: AIParseContext): Promise<FileParseResult>;
    /**
     * Parsa un file PDF usando AI
     */
    static parsePDF(file: ImportFile, _options: ImportOptions, aiContext?: AIParseContext): Promise<FileParseResult>;
    /**
     * Parsa un file in base al suo tipo MIME o estensione
     * FILOSOFIA: Usa sempre AI per parsing intelligente
     */
    static parseFile(file: ImportFile, options: ImportOptions, aiContext?: AIParseContext): Promise<FileParseResult>;
    /**
     * Parsa multiple file e combina i risultati
     */
    static parseFiles(files: ImportFile[], options: ImportOptions, aiContext?: AIParseContext): Promise<{
        programs: ImportedWorkoutProgram[];
        errors: Array<{
            fileName: string;
            error: string;
        }>;
        warnings: Array<{
            fileName: string;
            warnings: string[];
        }>;
    }>;
    /**
     * Combina più programmi parsati in uno solo
     */
    static combinePrograms(programs: ImportedWorkoutProgram[]): ImportedWorkoutProgram;
}
//# sourceMappingURL=file-parser.service.d.ts.map