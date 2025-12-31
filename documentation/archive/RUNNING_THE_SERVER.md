# 🚀 Quick Start - Running the Server

## ✅ Server is Running!

Your Literature Review backend server with authentication is now live!

```
🚀 Server: http://localhost:5000
🏥 Health: http://localhost:5000/v1/health
🔐 Auth API: http://localhost:5000/v1/auth
📊 Stages API: http://localhost:5000/v1/stages
```

---

## 📦 Dependencies Installed

All required packages are now installed:

### Core Dependencies
- ✅ `bcrypt` - Password hashing
- ✅ `jsonwebtoken` - JWT tokens
- ✅ `nodemailer` - Email sending
- ✅ `prisma` - Database ORM
- ✅ `@prisma/client` - Prisma client
- ✅ `zod` - Validation
- ✅ `express-rate-limit` - Rate limiting

### Type Definitions
- ✅ `@types/bcrypt`
- ✅ `@types/jsonwebtoken`
- ✅ `@types/nodemailer`

---

## 🎯 How to Run

### Start Development Server
```bash
cd literature-review-backend
npm run dev
```

**Server will start on:** `http://localhost:5000`

### Stop Server
Press `Ctrl+C` in the terminal

---

## 🧪 Test the Server

### 1. Health Check
```bash
curl http://localhost:5000/v1/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-28T13:05:08.212Z",
  "uptime": 123.456
}
```

### 2. Test Authentication Endpoint
```bash
curl -X POST http://localhost:5000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": { ... }
  },
  "message": "Registration successful..."
}
```

---

## 📚 Available Endpoints

### Authentication API (`/v1/auth`)
- POST `/register` - Register user
- POST `/login` - Login user
- GET `/verify-email` - Verify email
- POST `/resend-verification` - Resend verification
- POST `/forgot-password` - Request password reset
- POST `/reset-password` - Reset password
- POST `/refresh` - Refresh tokens
- POST `/logout` - Logout
- GET `/profile` - Get profile (protected)
- POST `/change-password` - Change password (protected)

### Literature Review API (`/v1/stages`)
- POST `/1` - Extract abstract
- POST `/2` - Generate research questions
- POST `/score` - Score papers

### Health Check (`/v1`)
- GET `/health` - Server health

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

### Database Connection Error
```bash
# Test database connection
npx prisma studio

# Check DATABASE_URL in .env
echo $env:DATABASE_URL
```

### Email Not Sending
```bash
# Test email configuration
node setup-tests/test-email.js
```

### Module Not Found
```bash
# Reinstall dependencies
npm install
```

---

## 📊 Server Logs

The server logs will show:
- ✅ Server startup
- ✅ Database connection
- ✅ Email service status
- ✅ API requests
- ✅ Errors and warnings

**Example Logs:**
```
[2025-12-28 18:35:08] INFO: 🚀 Server running on http://localhost:5000
[2025-12-28 18:35:08] INFO: 🔥 Environment: development
[2025-12-28 18:35:08] INFO: 🏥 Health check: http://localhost:5000/v1/health
[2025-12-28 18:35:08] INFO: ✓ Database connection successful
[2025-12-28 18:35:08] INFO: ✓ Email service connection successful
```

---

## 🎨 Development Workflow

### 1. Start Server
```bash
npm run dev
```

### 2. Make Changes
- Edit files in `src/`
- Server auto-reloads on save

### 3. Test Changes
- Use Postman or cURL
- Check server logs
- View database with `npx prisma studio`

### 4. Commit Changes
```bash
git add .
git commit -m "Your message"
```

---

## 📝 Next Steps

### Test the API
1. Import Postman collection: `documentation/testing/Auth_API.postman_collection.json`
2. Follow testing guide: `documentation/testing/TESTING_APIS.md`
3. Test all endpoints

### View Database
```bash
npx prisma studio
```
Opens at: `http://localhost:5555`

### Check Documentation
- **Authentication:** `documentation/AUTHENTICATION.md`
- **Database:** `documentation/DATABASE.md`
- **Testing:** `documentation/testing/TESTING_APIS.md`
- **API Complete:** `documentation/AUTH_API_COMPLETE.md`

---

## 🔑 Environment Variables

Make sure your `.env` file has:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_ACCESS_SECRET="your-64-char-secret"
JWT_REFRESH_SECRET="your-64-char-secret"

# Email
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# OpenAI
OPENAI_API_KEY="sk-..."
```

---

## ✨ What's Working

✅ **Server Running** - http://localhost:5000  
✅ **Database Connected** - PostgreSQL (Render)  
✅ **Authentication API** - 10 endpoints ready  
✅ **Literature Review API** - 3 stages ready  
✅ **Email Service** - SMTP configured  
✅ **Rate Limiting** - Security enabled  
✅ **Type Safety** - Full TypeScript  

---

## 🎉 Success!

Your server is running and ready to use!

**Test it now:**
```bash
curl http://localhost:5000/v1/health
```

**Or visit in browser:**
```
http://localhost:5000/v1/health
```

---

**Happy Coding!** 🚀

For detailed API documentation, see `documentation/testing/TESTING_APIS.md`
