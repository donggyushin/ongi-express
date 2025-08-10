# Ongi Express Server

Express.js backend server for ongi service built with TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- TypeScript knowledge

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

### Health Check
- `GET /health` - Server health status

### Main
- `GET /` - Welcome message and server info

## 🛠 Built With

- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger
- **dotenv** - Environment variable management
- **ts-node** - TypeScript execution for Node.js
- **nodemon** - Development server with auto-restart

## 📁 Project Structure

```
ongi-express/
├── src/
│   └── app.ts          # Main TypeScript application file
├── dist/               # Compiled JavaScript files (after build)
├── tsconfig.json       # TypeScript configuration
├── package.json        # Project dependencies and scripts
├── .env.example        # Environment variables template
├── .env               # Environment variables (not in git)
├── .gitignore         # Git ignore rules
└── README.md          # Project documentation
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

## 📝 License

This project is licensed under the ISC License.