/**
 * Shared Tools Re-exports
 *
 * Re-exports from @onecoach/lib-copilot-framework for backwards compatibility.
 * New code should import directly from '@onecoach/lib-copilot-framework'.
 *
 * @deprecated Import from '@onecoach/lib-copilot-framework' instead
 */

// Re-export everything from the framework package
export {
  // Agentic Framework
  createAgenticTool,
  type AgenticToolConfig,
  type AgenticActionHandler,

  // CRUD Framework
  createCrudTool,
  type CrudToolConfig,
  type CrudOperations,

  // Schema Builders
  createTargetSchema,
  SetGroupSchema,
  MacrosSchema,
  generateId,
  type TargetSchemaOptions,

  // Response Helpers
  successResult,
  errorResult,
  safeExecute,
  type ModificationResult,

  // Fuzzy Matching
  fuzzyMatch,
  fuzzyFindIndex,
  fuzzyFind,
  fuzzyFindAll,
} from '@onecoach/lib-copilot-framework';
