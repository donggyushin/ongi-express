# Ongi Express Server

Express.js backend server for ongi service

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

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
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📋 API Endpoints

### Health Check
- `GET /health` - Server health status

### Main
- `GET /` - Welcome message and server info

## 🛠 Built With

- **Express.js** - Web framework
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger
- **dotenv** - Environment variable management

## 📁 Project Structure

```
ongi-express/
├── app.js              # Main application file
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