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
- **Config**: Configuration classes (e.g., `DatabaseConfig` for PostgreSQL connection pooling)
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

**Database Integration**
- PostgreSQL database hosted on Railway
- Connection pooling via `DatabaseConfig` singleton
- Database service (`IDatabaseService`) for query execution
- Health check endpoint for database connectivity testing
- TypeScript-safe query execution with `QueryResultRow` constraints

**TypeScript Path Mapping**
- `@/*` maps to `src/*`
- Layer-specific aliases: `@/domain/*`, `@/infrastructure/*`, `@/presentation/*`, `@/shared/*`

### Adding New Features

1. **Create Domain Layer**: Define entities and use cases with interfaces
2. **Implement Infrastructure**: Create service implementations if needed
3. **Build Presentation**: Create controller, routes, and any required middlewares
4. **Register in Container**: Add all new services to the DI container
5. **Wire in App**: Register routes in `App.initializeRoutes()`

### Database Service Usage

**Accessing Database Service**
```typescript
// In use cases or controllers, get from DI container
const databaseService = this.container.get<IDatabaseService>('database');

// Execute queries with type safety
const result = await databaseService.query<UserRow>('SELECT * FROM users WHERE id = $1', [userId]);

// Health check
const isHealthy = await databaseService.healthCheck();
```

**Database Patterns**
- Use parameterized queries to prevent SQL injection
- Implement database operations in use cases, not controllers
- Use TypeScript interfaces for query result types
- Handle database errors gracefully with try-catch blocks
- Use connection pooling via `DatabaseConfig` singleton

### Environment Configuration

- Environment variables loaded via `dotenv`
- Default PORT: 3000
- NODE_ENV affects error message verbosity
- DATABASE_URL: PostgreSQL connection string (required for database operations)
- JWT_SECRET: Secret key for JWT tokens
- JWT_EXPIRES_IN: JWT token expiration time
- API_KEY: Optional API key for external services

### Railway Deployment

This application is deployed on Railway with the following setup:
- **Database**: Managed PostgreSQL with automatic connection string provisioning
- **Environment Variables**: Managed through Railway dashboard
- **Auto-deployment**: Triggered on Git push to main branch
- **SSL**: Automatic HTTPS endpoints
- **Health Checks**: Use `/health` and `/database/test` endpoints for monitoring

### Version Compatibility Notes

**Express Version**: Currently using Express 4.x (stable)
- Express 5.x is experimental and has path-to-regexp compatibility issues
- Avoid upgrading to Express 5.x until it reaches stable release
- If Express 5 upgrade is needed:
  1. Test thoroughly for path-to-regexp related errors
  2. May require changing wildcard routes from `app.use('*', ...)` to `app.all('*', ...)`
  3. Consider explicit path-to-regexp version pinning

**Troubleshooting Common Issues**:
- `TypeError: Missing parameter name`: Usually indicates Express 5 + path-to-regexp compatibility issue
- Solution: Downgrade to Express 4.x or wait for Express 5 stable release

### API Endpoints

**Core Endpoints**
- `GET /` - Welcome message and server info
- `GET /health` - Application health status with uptime
- `GET /database/test` - Database connectivity test and health check

**Endpoint Patterns**
- All responses follow `ApiResponse<T>` interface
- Health checks return boolean status with descriptive messages
- Error responses include both `error` and `message` fields
- Use RESTful conventions for new endpoints