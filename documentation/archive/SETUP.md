# 🚀 Quick Setup Guide

## Step 1: Add Your OpenAI API Key

1. Navigate to the backend directory:
   ```bash
   cd literature-review-backend
   ```

2. The `.env` file needs your OpenAI API key. You can either:
   - **Option A**: Copy `.env.example` to `.env` and edit it manually
   - **Option B**: Run this command (replace with your actual key):
     ```bash
     echo "OPENAI_API_KEY=sk-your-actual-key-here" >> .env
     ```

## Step 2: Start the Development Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
📝 Environment: development
🔍 Health check: http://localhost:5000/v1/health
```

## Step 3: Test the Health Endpoint

### Using Browser
Open: http://localhost:5000/v1/health

### Using Postman
1. Create a new request
2. Method: `GET`
3. URL: `http://localhost:5000/v1/health`
4. Click "Send"

### Using curl
```bash
curl http://localhost:5000/v1/health
```

### Expected Response
```json
{
  "data": {
    "status": "ok",
    "time": "2025-12-25T14:35:00.000Z"
  },
  "meta": {
    "requestId": "req_..."
  }
}
```

## ✅ Once Health Endpoint Works

Let me know and I'll implement **Stage 1: Intent Decomposition** next!

---

## 📁 Current Project Structure

```
Paper Agent/
├── STATUS.md                          ← Track progress here
├── idea.md
├── api_mvp.md
├── context_mvp.md
└── literature-review-backend/
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── .env                           ← Add your API key here
    ├── README.md
    └── src/
        ├── server.ts                  ← Entry point
        ├── app.ts
        ├── config/
        ├── middlewares/
        ├── routes/
        ├── controllers/
        └── types/
```
