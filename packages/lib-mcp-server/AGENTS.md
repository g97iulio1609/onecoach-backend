# lib-mcp-server - AI Agent Instructions

## Overview
This package provides MCP (Model Context Protocol) tools for AI agents to interact with OneCoach domains.

## Copilot CRUD Framework

The `shared/` module provides a reusable framework for creating AI-driven CRUD tools.

### Location
```
src/tools/shared/
├── copilot-crud-framework.ts  # createCrudTool factory
├── fuzzy-matching.ts          # fuzzyMatch, fuzzyFindIndex
├── response-helpers.ts        # successResult, errorResult
└── README.md                  # Detailed docs
```

### Creating New Domain Tools

```typescript
import { createCrudTool } from '../shared';

export const myDomainCrudTool = createCrudTool({
  name: 'my_domain_crud',
  domain: 'my_domain',
  description: 'CRUD operations for my domain',
  operations: ['create', 'read', 'update', 'delete'] as const,
  batchSupported: true,
  handlers: {
    create: async (args, context) => {
      // Implementation
      return { success: true, message: 'Created' };
    },
    // ... other handlers
  }
});
```

### Available Utilities

| Function | Usage |
|----------|-------|
| `createCrudTool(config)` | Factory for CRUD tools |
| `fuzzyMatch(target, search)` | Case-insensitive contains |
| `fuzzyFindIndex(arr, field, search)` | Find index by fuzzy name |
| `successResult(msg, data?)` | Standard success response |
| `errorResult(error)` | Standard error response |

### Domain Tools

| Domain | Tool Name | Operations |
|--------|-----------|------------|
| Nutrition | `nutrition_apply_modification` | update_meal, update_food, add_food, remove_food |
| OneAgenda | `oneagenda_apply_modification` | update_project, update_task, complete_task, update_milestone |
| Workout | `workout_apply_modification` | update/add/remove setgroups, exercises |

### Best Practices
1. Always use `successResult`/`errorResult` for consistent responses
2. Use `fuzzyFindIndex` for user-friendly entity targeting
3. Enable `batchSupported` for multi-operation use cases
4. Document all parameters with `.describe()` in Zod schemas
