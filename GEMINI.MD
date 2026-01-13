# OneCoach Backend - Agent Guide

> **Meta**: Backend API services monorepo. Modular packages for each domain (Workout, Nutrition, Coach, etc.).

## Quick Reference

| Attribute           | Value                                              |
| :------------------ | :------------------------------------------------- |
| **Monorepo**        | `submodules/onecoach-backend`                      |
| **Package Manager** | pnpm workspaces                                    |
| **Pattern**         | `api-*` = Entry points, `lib-*` = Shared libraries |

---

## Architecture

```
submodules/onecoach-backend/
├── packages/
│   ├── api-core/       # Main entry: Auth, Users, Base APIs
│   ├── api-workout/    # Workout planning & tracking
│   ├── api-nutrition/  # Nutrition planning & meals
│   ├── api-exercise/   # Exercise library
│   ├── api-food/       # Food database
│   ├── api-coach/      # AI Coach workflows
│   ├── api-analytics/  # Analytics & insights
│   ├── api-chat/       # Messaging (WebSocket)
│   ├── api-admin/      # Admin panel
│   ├── api-oneagenda/  # Scheduling services
│   │
│   ├── lib-core/       # Base utilities, helpers
│   ├── lib-api/        # Shared API definitions, schemas
│   ├── lib-api-client/ # Typed API client SDK
│   ├── lib-config/     # Centralized configuration
│   ├── lib-stores/     # State/persistence
│   └── lib-mcp-server/ # Model Context Protocol
```

---

## Key Patterns

### Service Architecture

- `api-*` contains controllers, routes, and service configs
- `lib-*` contains domain logic, types, utilities
- **Never duplicate logic** - move shared code to `lib-*`

### Configuration

All env vars managed in `lib-config`:

```typescript
import { config } from '@onecoach/lib-config';

const dbUrl = config.DATABASE_URL;
```

### Naming Conventions

| Type      | Convention | Example              |
| :-------- | :--------- | :------------------- |
| Files     | kebab-case | `user-controller.ts` |
| Classes   | PascalCase | `UserController`     |
| Functions | camelCase  | `getUserById`        |

---

## Operational Guide

### Finding Code

1. **Identify Domain**: Nutrition? Workout? Analytics?
2. **Check `lib-[domain]`**: Business logic here
3. **Check `api-[domain]`**: Endpoints here
4. **Fallback**: Generic utilities in `lib-core`

### Modifying Data Models

1. Locate model in `lib-*` package
2. Update type/interface
3. Update Zod schemas in `lib-api`
4. Run Prisma migrations if DB-backed

### Adding New Domain

```bash
# 1. Create package
mkdir packages/api-newdomain
mkdir packages/lib-newdomain

# 2. Add package.json with @onecoach/api-newdomain name

# 3. Link workspace
pnpm install
```

---

## Navigation Guide

| Task               | Location                 |
| :----------------- | :----------------------- |
| Add API endpoint   | `packages/api-[domain]/` |
| Add business logic | `packages/lib-[domain]/` |
| Add shared utility | `packages/lib-core/`     |
| Add env variable   | `packages/lib-config/`   |
| Add API schema     | `packages/lib-api/`      |
