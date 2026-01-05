/**
 * Nutrition Domain Configuration
 * 
 * Registers the nutrition domain with the copilot context framework.
 * 
 * @module lib-stores/copilot-context/domains
 */

import type { DomainConfig } from '../copilot-context.types';

// ============================================================================
// Context Types
// ============================================================================

export interface NutritionContextSelection {
  meal: { index: number; name: string } | null;
  food: { mealIndex: number; foodIndex: number; name: string } | null;
}

export interface NutritionContext {
  // Resource identification
  resourceId: string;
  
  // Main data (the nutrition plan)
  data: unknown; // NutritionPlan - keep generic for framework
  
  // Navigation state
  weekIndex: number | null;
  dayIndex: number | null;
  
  // Selection state
  selection: NutritionContextSelection;
  
  // Hover state
  hoveredElement: { type: string; indices: number[] } | null;
  
  // Clipboard for cut/copy
  clipboard: { type: string; data: unknown } | null;
}

// ============================================================================
// Domain Configuration
// ============================================================================

export const nutritionDomain: DomainConfig<unknown, NutritionContext> = {
  name: 'nutrition',
  
  createInitialContext: (resourceId, data): NutritionContext => ({
    resourceId,
    data: data ?? null,
    weekIndex: null,
    dayIndex: null,
    selection: {
      meal: null,
      food: null,
    },
    hoveredElement: null,
    clipboard: null,
  }),
  
  getDataFromContext: (context) => context.data,
  
  updateDataInContext: (context, data) => ({
    ...context,
    data,
  }),
  
  getResourceId: (context) => context.resourceId,
};
