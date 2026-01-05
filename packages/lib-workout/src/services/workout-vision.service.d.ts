/**
 * Workout Vision Service
 *
 * AI-powered parsing of workout programs from images, PDFs, documents, and spreadsheets.
 * Uses shared lib-import-core for AI parsing, credit handling, and retry logic.
 *
 * @module lib-workout/services/workout-vision
 */
import { type ImportedWorkoutProgram } from '@onecoach/schemas';
/**
 * Workout Vision Service
 *
 * Parses workout programs from various file formats using AI.
 * All methods use the shared lib-import-core parseWithVisionAI function.
 */
export declare class WorkoutVisionService {
    /**
     * Parse workout program from image (JPEG, PNG, WEBP, HEIC)
     */
    static parseImage(imageBase64: string, mimeType: string, userId: string): Promise<ImportedWorkoutProgram>;
    /**
     * Parse workout program from PDF
     */
    static parsePDF(pdfBase64: string, userId: string): Promise<ImportedWorkoutProgram>;
    /**
     * Parse workout program from document (DOCX, DOC, ODT)
     */
    static parseDocument(documentBase64: string, mimeType: string, userId: string): Promise<ImportedWorkoutProgram>;
    /**
     * Parse workout program from spreadsheet (CSV, XLSX)
     */
    static parseSpreadsheet(contentBase64: string, mimeType: string, userId: string): Promise<ImportedWorkoutProgram>;
}
//# sourceMappingURL=workout-vision.service.d.ts.map