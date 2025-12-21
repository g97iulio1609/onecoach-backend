/**
 * Food Vision Service
 *
 * Servizio per analisi immagini con OpenRouter + Gemini
 * Supporta estrazione etichette e segmentazione piatti
 */
import type { LabelExtractionResult, DishSegmentationResult } from '@onecoach/types';
/**
 * Salva configurazione modelli Vision nel metadata OpenRouter
 */
export declare function updateVisionModelConfig(labelModel?: string, segmentationModel?: string): Promise<void>;
export declare class FoodVisionService {
    /**
     * Estrae dati nutrizionali da etichetta alimentare
     */
    static extractLabelData(imageBase64: string, userId: string): Promise<LabelExtractionResult>;
    /**
     * Segmenta piatto identificando componenti e quantità
     */
    static segmentDish(imageBase64: string, userId: string): Promise<DishSegmentationResult>;
}
