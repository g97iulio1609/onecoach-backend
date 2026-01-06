/**
 * Food Vision Service
 *
 * AI-powered food analysis for nutrition tracking.
 * Uses shared lib-import-core for AI parsing, credit handling, and retry logic.
 *
 * @module lib-food/food-vision
 */
import type { LabelExtractionResult, DishSegmentationResult } from '@onecoach/types';
export declare class FoodVisionService {
    /**
     * Extract nutritional data from food label image
     */
    static extractLabelData(imageBase64: string, userId: string): Promise<LabelExtractionResult>;
    /**
     * Segment dish and identify food items with quantities
     */
    static segmentDish(imageBase64: string, userId: string): Promise<DishSegmentationResult>;
}
/**
 * Update vision model configuration in OpenRouter metadata
 */
export declare function updateVisionModelConfig(labelExtraction?: string, dishSegmentation?: string): Promise<void>;
//# sourceMappingURL=food-vision.service.d.ts.map