# Copilot CRUD Framework

A reusable, extensible framework for creating AI-driven CRUD tools across all domains.

## Overview

This module provides **two frameworks** for building MCP tools:

1. **CRUD Framework** (`createCrudTool`) - For standard Create/Read/Update/Delete operations
2. **Agentic Framework** (`createAgenticTool`) - For granular, action-based modifications (e.g., `update_setgroup`, `add_exercise`)

## Quick Start: CRUD Framework

```typescript
import { createCrudTool } from '../shared';

const myTool = createCrudTool({
  name: 'my_domain_crud',
  domain: 'my_domain',
  description: 'Manages my domain entities',
  operations: ['create', 'read', 'update', 'delete'] as const,
  batchSupported: true,
  handlers: {
    create: async (args, ctx) => successResult('Created', newEntity),
    read: async (args, ctx) => successResult('Found', entity),
    update: async (args, ctx) => successResult('Updated', entity),
    delete: async (args, ctx) => successResult('Deleted'),
  },
});
```

## Quick Start: Agentic Framework

For granular modifications with action/target/changes pattern:

```typescript
import { createAgenticTool, type AgenticActionHandler } from '../shared';
import { SetGroupSchema } from '../shared/schema-builders';

const updateSetgroup: AgenticActionHandler<WorkoutProgram> = {
  description: 'Update setgroup (sets, reps, weight, intensity)',
  targetSchema: z.object({
    weekIndex: z.number().optional(),
    dayIndex: z.number().optional(),
    exerciseName: z.string().optional(),
    setgroupIndex: z.number().optional(),
  }),
  changesSchema: SetGroupSchema,
  execute: (entity, { target, changes }, ctx) => {
    // Apply changes to entity...
    return entity;
  },
};

const myTool = createAgenticTool({
  name: 'my_domain_apply_modification',
  domain: 'my_domain',
  entityIdField: 'entityId',
  description: 'Applies granular modifications',
  resolveEntity: async (id) => fetchFromDB(id),
  saveEntity: async (id, entity) => saveToDB(id, entity),
  actions: {
    update_setgroup: updateSetgroup,
    add_item: addItemHandler,
    remove_item: removeItemHandler,
  },
});
```

## Features

| Framework | Use Case | Pattern |
|-----------|----------|---------|
| **CRUD** | Standard entity operations | `operation: create/read/update/delete` |
| **Agentic** | Granular modifications | `action: update_X/add_X/remove_X` + `target` + `changes` |

## Utilities

### Fuzzy Matching

```typescript
import { fuzzyMatch, fuzzyFindIndex } from '../shared';

fuzzyMatch('Colazione', 'cola');           // true
fuzzyFindIndex(meals, 'name', 'pran');     // finds "Pranzo"
```

### Response Helpers

```typescript
import { successResult, errorResult } from '../shared';

return successResult('Item updated', updatedItem);
return errorResult('Item not found');
```

### Schema Builders

```typescript
import { createTargetSchema, SetGroupSchema, MacrosSchema } from '../shared';

// Create hierarchical target schema
const workoutTarget = createTargetSchema({
  week: true,
  day: true,
  itemField: 'exercise',
  subItemField: 'setgroup',
});
```

## Architecture

```
shared/
├── index.ts                   # Re-exports all
├── copilot-crud-framework.ts  # CRUD factory + types
├── agentic-framework.ts       # Agentic factory for modifications
├── schema-builders.ts         # Reusable Zod schemas
├── fuzzy-matching.ts          # String matching
├── response-helpers.ts        # Responses
└── README.md                  # Docs
```

## Adding a New Domain

### For Standard CRUD:
1. Create `tools/my_domain/crud.ts`
2. Import `createCrudTool` from `../shared`
3. Define handlers for each operation

### For Granular Modifications:
1. Create `tools/my_domain/granular.ts`
2. Import `createAgenticTool` from `../shared`
3. Define action handlers with schemas
4. Configure entity resolve/save functions

