# Literature Review Backend

LLM-Driven Literature Review and Research Gap Discovery System - Backend API

## 🚀 Quick Start

### Prerequisites
- Node.js (LTS version, v18+)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`:
```env
OPENAI_API_KEY=your_actual_api_key_here
```

### Running the Server

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

## 📋 API Documentation

Base URL: `http://localhost:5000/v1`

### Health Check
```bash
GET /v1/health
```

**Response:**
```json
{
  "data": {
    "status": "ok",
    "time": "2025-12-25T12:00:00.000Z"
  },
  "meta": {
    "requestId": "req_..."
  }
}
```

## 🏗️ Project Structure

```
literature-review-backend/
├── src/
│   ├── app.ts                 # Express app setup
│   ├── server.ts              # Server entry point
│   ├── config/                # Configuration
│   │   ├── env.ts
│   │   └── logger.ts
│   ├── middlewares/           # Express middlewares
│   │   ├── requestId.ts
│   │   ├── requestLogger.ts
│   │   ├── errorHandler.ts
│   │   └── validate.ts
│   ├── routes/                # Route definitions
│   │   ├── index.ts
│   │   └── health.routes.ts
│   ├── controllers/           # Request handlers
│   │   └── health.controller.ts
│   ├── services/              # Business logic (to be added)
│   ├── types/                 # TypeScript types
│   │   ├── api.ts
│   │   └── domain.ts
│   └── utils/                 # Utility functions (to be added)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🧪 Testing with Postman

1. Import the health endpoint:
   - Method: `GET`
   - URL: `http://localhost:5000/v1/health`

2. Expected response includes:
   - `data.status`: "ok"
   - `data.time`: ISO timestamp
   - `meta.requestId`: Unique request ID

## 📝 Development Status

See [STATUS.md](../STATUS.md) for current implementation progress.

## 🔧 Environment Variables

See `.env.example` for all available configuration options.

## 📚 Next Steps

- [ ] Test health endpoint
- [ ] Implement Stage 1: Intent Decomposition
- [ ] Implement Stage 2: Query Generation
- [ ] Implement Stage 3: Paper Retrieval
- [ ] Continue with remaining stages...
