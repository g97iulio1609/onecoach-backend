/**
 * OneAgenda Domain Configuration
 * 
 * Registers the OneAgenda domain with the copilot context framework.
 * 
 * @module lib-stores/copilot-context/domains
 */

import type { DomainConfig } from '../copilot-context.types';

// ============================================================================
// Context Types
// ============================================================================

export interface OneAgendaContextSelection {
  task: { id: string; name: string } | null;
  milestone: { id: string; name: string } | null;
}

export interface OneAgendaContextData {
  project: unknown; // Project
  tasks: unknown[]; // Task[]
  milestones: unknown[]; // Milestone[]
}

export interface OneAgendaContext {
  // Resource identification
  resourceId: string;
  
  // Main data (project + tasks + milestones)
  data: OneAgendaContextData | null;
  
  // Selection state
  selection: OneAgendaContextSelection;
  
  // Related tasks for context
  subtasks: string[];
  parallelTasks: string[];
  
  // Hover state
  hoveredElement: { type: string; id: string } | null;
}

// ============================================================================
// Domain Configuration
// ============================================================================

export const oneAgendaDomain: DomainConfig<OneAgendaContextData, OneAgendaContext> = {
  name: 'oneagenda',
  
  createInitialContext: (resourceId, data): OneAgendaContext => ({
    resourceId,
    data: data ?? null,
    selection: {
      task: null,
      milestone: null,
    },
    subtasks: [],
    parallelTasks: [],
    hoveredElement: null,
  }),
  
  getDataFromContext: (context) => context.data,
  
  updateDataInContext: (context, data) => ({
    ...context,
    data,
  }),
  
  getResourceId: (context) => context.resourceId,
};
