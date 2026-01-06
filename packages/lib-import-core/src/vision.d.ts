/**
 * Vision Parser Core
 *
 * Unified AI vision parsing with:
 * - Credit management via creditService (lib-core)
 * - Retry with exponential backoff + model fallback
 * - Streaming with structured output (Zod)
 *
 * Used by all domain VisionServices (Workout, Food, BodyMeasurements, etc.)
 *
 * @module lib-import-core/vision
 */
import type { VisionParseParams } from './types';
/**
 * Parse content with AI vision/text models
 *
 * Unified entry point for all domain services.
 * Handles credit management, retry logic, and structured output.
 */
export declare function parseWithVisionAI<T>(params: VisionParseParams<T>): Promise<T>;
//# sourceMappingURL=vision.d.ts.map