# Ongi Express Server

Express.js backend server for ongi service built with TypeScript and Clean Architecture principles

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- TypeScript knowledge
- Understanding of Clean Architecture principles (recommended)

### Installation

1. Clone the repository
```bash
git clone https://github.com/donggyushin/ongi-express.git
cd ongi-express
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Edit `.env` file with your configuration

### Running the Server

```bash
# Build TypeScript to JavaScript
npm run build

# Development mode (with ts-node and nodemon)
npm run dev

# Production mode (requires build first)
npm start

# Type checking only
npm run typecheck
```

The server will start on `http://localhost:3000`

## 📋 API Endpoints

All API responses follow a consistent format:
```typescript
{
  "success": boolean,
  "data?": any,        // Present on successful responses
  "message?": string,  // Optional message
  "error?": string     // Present on error responses
}
```

### Health Check
- `GET /health` - Server health status with uptime information

### Main
- `GET /` - Welcome message and server info

## 🛠 Built With

- **TypeScript** - Type-safe JavaScript
- **Express.js 4.x** - Web framework (stable version)
- **Clean Architecture** - Layered architecture with dependency inversion
- **Dependency Injection** - Custom DI container for service management
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger
- **dotenv** - Environment variable management
- **ts-node** - TypeScript execution for Node.js
- **nodemon** - Development server with auto-restart

## 📁 Project Structure

This project follows Clean Architecture principles with strict layer separation:

```
ongi-express/
├── src/
│   ├── app.ts                          # Main application entry point
│   ├── domain/                         # Business logic layer
│   │   ├── entities/                   # Core business objects
│   │   │   ├── health.entity.ts
│   │   │   └── index.ts
│   │   └── use-cases/                  # Business logic implementation
│   │       ├── health.use-case.ts
│   │       ├── welcome.use-case.ts
│   │       └── index.ts
│   ├── infrastructure/                 # External services layer
│   │   └── services/                   # Service implementations
│   │       ├── logger.service.ts
│   │       └── index.ts
│   ├── presentation/                   # API layer
│   │   ├── controllers/                # HTTP request handlers
│   │   │   ├── health.controller.ts
│   │   │   ├── welcome.controller.ts
│   │   │   └── index.ts
│   │   ├── middlewares/                # Cross-cutting concerns
│   │   │   ├── error.middleware.ts
│   │   │   └── index.ts
│   │   └── routes/                     # API endpoint definitions
│   │       ├── health.routes.ts
│   │       ├── welcome.routes.ts
│   │       └── index.ts
│   └── shared/                         # Common utilities
│       ├── types/                      # Shared type definitions
│       │   ├── response.ts
│       │   └── index.ts
│       └── utils/                      # Utilities and DI container
│           ├── container.ts
│           └── index.ts
├── dist/                               # Compiled JavaScript files
├── tsconfig.json                       # TypeScript configuration
├── package.json                        # Project dependencies and scripts
├── .env.example                        # Environment variables template
├── CLAUDE.md                           # Development guidelines for Claude Code
└── README.md                           # Project documentation
```

### Architecture Layers

- **Domain**: Core business logic and entities (framework-independent)
- **Infrastructure**: External services and implementations
- **Presentation**: Controllers, routes, and middlewares (Express.js specific)
- **Shared**: Common types, utilities, and dependency injection container

### Dependency Flow
Dependencies only flow inward: Presentation → Domain ← Infrastructure ← Shared

## 🏗️ Architecture Features

- **Dependency Injection**: Custom DI container manages all service dependencies
- **Interface-based Design**: All use cases and services implement interfaces
- **Error Handling**: Centralized error middleware with environment-aware responses
- **Type Safety**: Full TypeScript coverage with strict compiler options
- **Path Mapping**: Clean imports using `@/` aliases for different layers

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode (affects error verbosity) | `development` |

## ⚠️ Known Issues & Compatibility

### Express Version Compatibility
- **Current Version**: Express 4.21.2 (stable and recommended)
- **Express 5.x Status**: Experimental - has known compatibility issues with path-to-regexp
- **Issue**: Upgrading to Express 5.x causes `TypeError: Missing parameter name` errors
- **Recommendation**: Stay on Express 4.x until Express 5 reaches stable release

### Troubleshooting
If you encounter path-to-regexp related errors:
1. Ensure Express version is 4.x: `npm install express@^4.21.2`
2. Update type definitions: `npm install -D @types/express@^4.17.23`
3. Avoid explicit path-to-regexp installation unless necessary

## 📝 License

This project is licensed under the ISC License.