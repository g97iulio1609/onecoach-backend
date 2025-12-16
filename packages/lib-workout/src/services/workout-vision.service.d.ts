/**
 * Workout Vision Service
 *
 * Servizio SOTA per parsing intelligente di programmi di allenamento
 * da immagini, PDF, documenti e spreadsheet usando AI models.
 *
 * Features:
 * - Parsing multi-formato (immagini, PDF, documenti, CSV/XLSX)
 * - Structured output con Zod schema
 * - Gestione crediti automatica
 * - Retry con backoff esponenziale
 * - Rate limiting e fallback modelli
 *
 * @module lib-workout/services/workout-vision
 */
import { type ImportedWorkoutProgram } from '../schemas/imported-workout.schema';
/**
 * Workout Vision Service
 *
 * Parsing AI di workout programs da file multimediali e spreadsheet
 */
export declare class WorkoutVisionService {
    /**
     * Parse programma da immagine (JPEG, PNG, WEBP, HEIC)
     */
    static parseImage(imageBase64: string, mimeType: string, userId: string): Promise<ImportedWorkoutProgram>;
    /**
     * Parse programma da PDF
     */
    static parsePDF(pdfBase64: string, userId: string): Promise<ImportedWorkoutProgram>;
    /**
     * Parse programma da documento (DOCX, DOC, ODT)
     */
    static parseDocument(documentBase64: string, mimeType: string, userId: string): Promise<ImportedWorkoutProgram>;
    /**
     * Parse programma da spreadsheet (CSV, XLSX)
     * Usa parsing testuale invece di vision
     */
    static parseSpreadsheet(contentBase64: string, mimeType: string, userId: string): Promise<ImportedWorkoutProgram>;
    /**
     * Chiamata AI con text model per spreadsheet
     *
     * Pattern identico a workout-generation-orchestrator.service.ts:
     * - Usa createOpenAI direttamente con OpenRouter baseURL
     * - Usa streamText con Output.object() per maggiore affidabilità
     * - Logging dettagliato di cosa viene inviato al modello
     */
    private static callTextAI;
    /**
     * Core parsing method con vision model (per immagini, PDF, documenti)
     */
    private static parseWithVisionAI;
    /**
     * Chiamata AI con vision model
     */
    private static callVisionAI;
    /**
     * Aggiorna configurazione modelli nel database
     */
    static updateModelConfig(config: {
        imageExtraction?: string;
        pdfExtraction?: string;
        documentExtraction?: string;
        spreadsheetExtraction?: string;
        fallback?: string;
    }): Promise<void>;
}
//# sourceMappingURL=workout-vision.service.d.ts.map