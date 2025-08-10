# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production server (requires build first)
npm start

# Type checking only
npm run typecheck
```

## Clean Architecture Structure

This Express.js application follows Clean Architecture principles with strict layer separation:

### Layer Dependencies (inward only)
- **Presentation** → **Domain** → **Infrastructure** → **Shared**
- Dependencies only flow inward; outer layers cannot be imported by inner layers

### Core Architecture Components

**Dependency Injection Container (`src/shared/utils/container.ts`)**
- Singleton pattern managing all service dependencies
- Services are registered in `registerServices()` method
- All layers use the container for dependency resolution
- When adding new services: register them in the container and inject dependencies

**Domain Layer (`src/domain/`)**
- **Entities**: Pure business objects (e.g., `HealthStatus`)
- **Use Cases**: Business logic implementation with interfaces
- No dependencies on external frameworks or infrastructure

**Infrastructure Layer (`src/infrastructure/`)**
- **Services**: External service implementations (logging, databases, APIs)
- Implements interfaces defined in domain layer

**Presentation Layer (`src/presentation/`)**
- **Controllers**: Handle HTTP requests, call use cases, return responses
- **Routes**: Define API endpoints and wire controllers
- **Middlewares**: Cross-cutting concerns (error handling, validation)

**Shared Layer (`src/shared/`)**
- **Types**: Common interfaces and types used across layers
- **Utils**: Utilities like the DI container

### Key Patterns

**API Response Format**
All API responses follow the `ApiResponse<T>` interface:
```typescript
{
  success: boolean;
  data?: T;           // For successful responses
  message?: string;   // Optional message
  error?: string;     // Error description for failures
}
```

**Error Handling**
- Global error middleware in `ErrorMiddleware`
- Production vs development error messages
- Centralized 404 handling
- All errors are logged via `ILoggerService`

**TypeScript Path Mapping**
- `@/*` maps to `src/*`
- Layer-specific aliases: `@/domain/*`, `@/infrastructure/*`, `@/presentation/*`, `@/shared/*`

### Adding New Features

1. **Create Domain Layer**: Define entities and use cases with interfaces
2. **Implement Infrastructure**: Create service implementations if needed
3. **Build Presentation**: Create controller, routes, and any required middlewares
4. **Register in Container**: Add all new services to the DI container
5. **Wire in App**: Register routes in `App.initializeRoutes()`

### Environment Configuration

- Environment variables loaded via `dotenv`
- Default PORT: 3000
- NODE_ENV affects error message verbosity