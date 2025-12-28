# Copilot CRUD Framework

A reusable, extensible framework for creating AI-driven CRUD tools across all domains.

## Overview

This framework provides a factory-based approach to creating MCP tools for CRUD operations (Create, Read, Update, Delete). It ensures consistency across all domains and makes adding new domains trivial.

## Quick Start

```typescript
import { createCrudTool, CrudOperations } from '../shared';
import { z } from 'zod';

const myTool = createCrudTool({
  name: 'my_domain_crud',
  domain: 'my_domain',
  description: 'Manages my domain entities',
  operations: ['create', 'read', 'update', 'delete'] as const,
  batchSupported: true,
  handlers: {
    create: async (args, ctx) => {
      // Create entity...
      return { success: true, message: 'Created', updated: newEntity };
    },
    read: async (args, ctx) => {
      return { success: true, message: 'Found', updated: entity };
    },
    update: async (args, ctx) => {
      return { success: true, message: 'Updated', updated: entity };
    },
    delete: async (args, ctx) => {
      return { success: true, message: 'Deleted' };
    },
  },
});
```

## Features

| Feature | Description |
|---------|-------------|
| **CRUD Operations** | create, read, update, delete |
| **Batch Support** | Multiple operations in one call |
| **Fuzzy Matching** | Find entities by partial names |
| **Standardized Responses** | Consistent success/error format |

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

## Architecture

```
shared/
├── index.ts                   # Re-exports all
├── copilot-crud-framework.ts  # Factory + types
├── fuzzy-matching.ts          # String matching
├── response-helpers.ts        # Responses
└── README.md                  # Docs
```

## Adding a New Domain

1. Create `tools/my_domain/granular.ts`
2. Import `createCrudTool` from `../shared`
3. Define handlers for each operation
4. Export the tool from domain index
