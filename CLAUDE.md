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

# Prisma commands
npx prisma generate        # Generate Prisma client after schema changes
npx prisma migrate dev     # Create and apply new migrations
npx prisma migrate reset   # ⚠️ DANGER: Resets database and deletes ALL data
npx prisma db push         # Push schema changes without migration files
npx prisma studio          # Open Prisma Studio for database management
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
- **Entities**: Pure business objects (e.g., `HealthStatus`, `Account`, `Profile`, `QnA`)
- **Repositories**: Interface contracts for data access (e.g., `IAccountRepository`)
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

**Authentication & Authorization**
- JWT-based authentication with access and refresh tokens
- `AuthMiddleware` handles token verification and user identification
- Protected routes require `Authorization: Bearer <token>` header
- Authenticated requests have `req.userId` containing the account ID

**Error Handling**
- Global error middleware in `ErrorMiddleware`
- Production vs development error messages
- Centralized 404 handling
- All errors are logged via `ILoggerService`

**Database Integration**
- PostgreSQL database hosted on Railway
- **Prisma ORM** for type-safe database operations (preferred)
- **Legacy Database Service** (`IDatabaseService`) for direct SQL queries when needed
- Automatic schema migrations via Prisma
- Health check endpoint for database connectivity testing
- TypeScript-safe operations with auto-generated Prisma client

**TypeScript Path Mapping**
- `@/*` maps to `src/*`
- Layer-specific aliases: `@/domain/*`, `@/infrastructure/*`, `@/presentation/*`, `@/shared/*`

### Adding New Features

1. **Create Domain Layer**: Define entities, repository interfaces, and use cases
2. **Update Database Schema**: Modify `prisma/schema.prisma` and run `npx prisma migrate dev`
3. **Implement Infrastructure**: Create Prisma service implementations
4. **Build Presentation**: Create controller, routes, and any required middlewares
5. **Register in Container**: Add all new services to the DI container
6. **Wire in App**: Register routes in `App.initializeRoutes()`

### Authentication Implementation

**Using AuthMiddleware in Controllers**
```typescript
import { AuthenticatedRequest } from '@/presentation/middlewares';

export class MyController {
  constructor(private profileRepository: IProfileRepository) {}

  // Protected endpoint - requires authentication
  myProtectedEndpoint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const accountId = req.userId; // Account ID from JWT token
      
      if (!accountId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User authentication required'
        };
        res.status(401).json(response);
        return;
      }

      // Convert account ID to profile for business logic
      const profile = await this.profileRepository.findByAccountId(accountId);
      if (!profile) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Profile not found'
        };
        res.status(404).json(response);
        return;
      }

      // Use profile.id for business operations
      const result = await this.someUseCase.execute(profile.id);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      // Error handling...
    }
  };
}
```

**Protecting Routes with AuthMiddleware**
```typescript
// In route definitions
this.router.get('/protected-endpoint', 
  AuthMiddleware.verifyToken,  // Middleware validates JWT and sets req.userId
  this.myController.myProtectedEndpoint
);

// Optional authentication (user may or may not be logged in)
this.router.get('/optional-auth-endpoint',
  AuthMiddleware.optionalVerifyToken,  // Sets req.userId only if valid token provided
  this.myController.myOptionalEndpoint
);
```

### Database Usage

**Preferred: Prisma Service**
```typescript
// In service implementations, get Prisma client from DI container
const prisma = this.container.get<PrismaClient>('prisma');

// Type-safe database operations
const account = await prisma.account.create({
  data: { id: 'user123', type: 'apple' }
});

const user = await prisma.account.findUnique({
  where: { id: 'user123' }
});
```

**Legacy: Direct Database Service**
```typescript
// Only use when Prisma operations are insufficient
const databaseService = this.container.get<IDatabaseService>('database');

// Execute raw queries with type safety
const result = await databaseService.query<UserRow>('SELECT * FROM users WHERE id = $1', [userId]);

// Health check
const isHealthy = await databaseService.healthCheck();
```

**Database Patterns**
- **Prefer Prisma operations** over raw SQL for type safety and maintainability
- Use parameterized queries to prevent SQL injection (when using raw SQL)
- Implement database operations in infrastructure services, not use cases
- Use repository pattern: Domain defines interfaces, Infrastructure implements them
- Handle database errors gracefully with try-catch blocks
- Use Prisma migrations for schema changes

**⚠️ CRITICAL DATABASE SAFETY WARNING ⚠️**
- **NEVER use `npx prisma migrate reset`** - This command deletes ALL data permanently
- **Development and Production share the same database** - All data changes affect real user data
- **Always use `npx prisma db push`** for schema changes to avoid data loss
- **Before any schema changes**: Backup important data or test on local environment first
- **If migration is absolutely necessary**: Create individual migrations with `npx prisma migrate dev --name descriptive-name`
- **Data is irreplaceable**: Treat every database operation as if it affects production users

### Environment Configuration

Environment variables loaded via `dotenv`:

**Server Configuration**
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode, affects error message verbosity (default: development)

**Database Configuration**
- `DATABASE_URL`: PostgreSQL connection string (required for database operations)

**Authentication Configuration**
- `JWT_SECRET`: Secret key for JWT token authentication (required)
- `JWT_EXPIRES_IN`: JWT token expiration time (default: 7d)

**External Services Configuration**
- `API_KEY`: Optional API key for external services
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name for image storage (optional)
- `CLOUDINARY_API_KEY`: Cloudinary API key for image operations (optional)
- `CLOUDINARY_API_SECRET`: Cloudinary API secret for image operations (optional)

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

**Account Management**
- `POST /accounts` - Create a new user account (supports apple, email, kakao, gmail types)
- Automatically creates associated Profile with default nickname (random CUID)
- Returns existing account if duplicate creation attempted
- Validates account type enum and required fields

**Authentication Patterns**
- Use `AuthenticatedRequest` interface for protected routes
- Access user info via `req.userId` (contains account ID)
- Convert account ID to profile ID using `IProfileRepository.findByAccountId()`
- Prefer accessToken-based identification over URL parameters for security

**Endpoint Patterns**
- All responses follow `ApiResponse<T>` interface
- Health checks return boolean status with descriptive messages
- Error responses include both `error` and `message` fields
- Use RESTful conventions for new endpoints
- Account creation prevents duplicates by returning existing records

### Prisma Schema Management

**Schema Definition (`prisma/schema.prisma`)**
- Define database models with TypeScript-like syntax
- Automatic enum generation for account types
- Built-in field validation and constraints
- Relationship definitions between models

**Example Schema:**
```prisma
model Account {
  id        String      @id
  type      AccountType
  createdAt DateTime    @default(now()) @map("created_at")

  @@map("accounts")
}

model Profile {
  id           String    @id @default(cuid())
  accountId    String    @unique @map("account_id")
  nickname     String    @unique @db.VarChar(50) @default(cuid())
  profileImage String?   @map("profile_image")
  images       String[]  @default([])
  mbti         MBTIType?
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  
  qnas         QnA[]

  @@map("profiles")
}

model QnA {
  id        String   @id @default(cuid())
  profileId String   @map("profile_id")
  question  String   @db.VarChar(500)
  answer    String   @db.VarChar(1500)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  profile   Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@map("qnas")
}

enum AccountType {
  email
  apple
  kakao
  gmail
}

enum MBTIType {
  INTJ
  INTP
  ENTJ
  ENTP
  INFJ
  INFP
  ENFJ
  ENFP
  ISTJ
  ISFJ
  ESTJ
  ESFJ
  ISTP
  ISFP
  ESTP
  ESFP
}
```

**Migration Workflow:**
1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive-name`
3. Prisma auto-generates migration SQL files
4. Run `npx prisma generate` to update TypeScript client
5. Update service implementations if needed

**Best Practices:**
- Use descriptive migration names
- Review generated migration SQL before applying
- Test migrations on development database first
- Use `@@map()` to match existing table names
- Define enums in schema for type safety

### Entity Relationships and Business Logic

**Account-Profile Relationship (One-to-One)**
- Every Account must have exactly one Profile (required relationship)
- Account creation automatically creates an associated Profile
- Profile contains user-customizable data: nickname, images, MBTI type
- Profile deletion cascades when Account is deleted

**Profile-QnA Relationship (One-to-Many)**
- Each Profile can have multiple QnA entries
- QnA entries contain question (max 500 chars) and answer (max 1500 chars)
- QnA entries are automatically deleted when Profile is deleted (cascade)

**Entity Structure:**
- **Account**: Core authentication entity with account type and creation timestamp
- **Profile**: User profile data with nickname (unique, 50 chars max), profile image, image gallery, MBTI type
- **QnA**: Question and answer pairs associated with user profiles

**Default Values:**
- Profile nickname: Auto-generated CUID (to be enhanced later)
- Profile images: Empty array
- Profile MBTI: Null (user can set later)
- All IDs: Auto-generated CUIDs except Account.id (user-provided)

**Business Rules:**
- Account creation is atomic: both Account and Profile are created in a single transaction
- Unique constraints: Profile.accountId, Profile.nickname
- Account lookup includes full Profile and QnA data for complete user context