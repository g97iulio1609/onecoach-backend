/**
 * MCP Nutrition Tools Index
 *
 * Complete nutrition domain tools for MCP integration.
 *
 * @module lib-mcp-server/tools/nutrition
 */

// New comprehensive nutrition tools
export * from './plan';
export * from './day-meal';
export * from './tracking';
export * from './import';
export * from './granular';

// Re-export tool arrays for convenience
import { nutritionPlanTools } from './plan';
import { nutritionDayMealTools } from './day-meal';
import { nutritionTrackingTools } from './tracking';
import { nutritionImportTool } from './import';
import { nutritionApplyModificationTool } from './granular';

/**
 * All nutrition-related MCP tools
 */
export const allNutritionTools = [
  ...nutritionPlanTools,
  ...nutritionDayMealTools,
  ...nutritionTrackingTools,
  nutritionImportTool,
  nutritionApplyModificationTool,
];
