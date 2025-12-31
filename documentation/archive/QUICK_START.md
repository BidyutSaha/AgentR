# Quick Start Guide: Authentication & Frontend

This guide will help you get started with implementing the new authentication system and frontend.

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ Node.js 18+ installed
- ✅ PostgreSQL 14+ installed
- ✅ Git installed
- ✅ Code editor (VS Code recommended)
- ✅ Gmail account (for SMTP) or other email service

---

## 🚀 Quick Setup (30 minutes)

### Step 1: Install Backend Dependencies (5 min)

```bash
cd literature-review-backend
npm install prisma @prisma/client bcrypt jsonwebtoken nodemailer
npm install -D @types/bcrypt @types/jsonwebtoken @types/nodemailer
```

### Step 2: Setup Database (5 min)

```bash
# Create PostgreSQL database
createdb literature_review

# Initialize Prisma
npx prisma init
```

### Step 3: Configure Environment (5 min)

Edit `.env` file:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/literature_review"

# JWT (generate random 32+ char strings)
JWT_ACCESS_SECRET="your-super-secret-access-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Email (Gmail example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-gmail-app-password"
EMAIL_FROM="noreply@literaturereview.com"

# Frontend
FRONTEND_URL="http://localhost:3000"

# Security
BCRYPT_ROUNDS="12"

# Existing
OPENAI_API_KEY="your-openai-key"
```

**Note**: For Gmail, you need to create an [App Password](https://support.google.com/accounts/answer/185833).

### Step 4: Create Prisma Schema (10 min)

Copy this into `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                      String    @id @default(uuid())
  email                   String    @unique
  passwordHash            String    @map("password_hash")
  firstName               String?   @map("first_name")
  lastName                String?   @map("last_name")
  isVerified              Boolean   @default(false) @map("is_verified")
  isActive                Boolean   @default(true) @map("is_active")
  createdAt               DateTime  @default(now()) @map("created_at")
  updatedAt               DateTime  @updatedAt @map("updated_at")
  lastLogin               DateTime? @map("last_login")

  emailVerificationTokens EmailVerificationToken[]
  passwordResetTokens     PasswordResetToken[]
  refreshTokens           RefreshToken[]

  @@map("users")
}

model EmailVerificationToken {
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  token     String    @unique
  expiresAt DateTime  @map("expires_at")
  createdAt DateTime  @default(now()) @map("created_at")
  usedAt    DateTime? @map("used_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("email_verification_tokens")
}

model PasswordResetToken {
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  token     String    @unique
  expiresAt DateTime  @map("expires_at")
  createdAt DateTime  @default(now()) @map("created_at")
  usedAt    DateTime? @map("used_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("password_reset_tokens")
}

model RefreshToken {
  id              String    @id @default(uuid())
  userId          String    @map("user_id")
  token           String    @unique
  expiresAt       DateTime  @map("expires_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  revokedAt       DateTime? @map("revoked_at")
  replacedByToken String?   @map("replaced_by_token")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
}
```

### Step 5: Run Migrations (5 min)

```bash
# Generate Prisma Client and create database tables
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### Step 6: Setup Frontend (5 min)

```bash
# Go back to root directory
cd ..

# Create React app with Vite
npm create vite@latest literature-review-frontend -- --template react-ts

# Install dependencies
cd literature-review-frontend
npm install react-router-dom axios react-hook-form @hookform/resolvers zod
npm install -D @types/node
```

### Step 7: Configure Frontend Environment

Create `literature-review-frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/v1
VITE_APP_NAME=Literature Review System
```

---

## 📖 What to Read Next

Now that you have the basic setup, follow the implementation plan:

### For Backend Development
1. Read **`DATABASE.md`** - Understand the database schema
2. Read **`AUTHENTICATION.md`** - Understand auth flows
3. Follow **`IMPLEMENTATION_PLAN.md`** - Phases 1-4

### For Frontend Development
1. Read **`FRONTEND.md`** - Understand frontend architecture
2. Follow **`IMPLEMENTATION_PLAN.md`** - Phases 5-11

### For Testing
1. Create test accounts
2. Test all auth flows
3. Test protected routes
4. Test responsive design

---

## 🔧 Development Workflow

### Backend Development

```bash
cd literature-review-backend

# Start development server
npm run dev

# Watch for changes (if using nodemon)
npm run dev

# Run Prisma Studio (database GUI)
npx prisma studio
```

### Frontend Development

```bash
cd literature-review-frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📝 Implementation Checklist

### Phase 1: Backend Auth (Week 1)

- [ ] Install dependencies
- [ ] Setup database
- [ ] Create Prisma schema
- [ ] Run migrations
- [ ] Create `src/config/database.ts`
- [ ] Create `src/config/email.ts`
- [ ] Create `src/utils/crypto.ts`
- [ ] Create `src/types/auth.ts`
- [ ] Create `src/services/auth/password.service.ts`
- [ ] Create `src/services/auth/token.service.ts`
- [ ] Create `src/services/auth/email.service.ts`
- [ ] Create `src/services/auth/auth.service.ts`
- [ ] Create `src/services/auth/auth.schema.ts`
- [ ] Create `src/middlewares/auth.ts`
- [ ] Create `src/middlewares/rateLimit.ts`
- [ ] Create `src/controllers/auth.controller.ts`
- [ ] Create `src/routes/auth.routes.ts`
- [ ] Update `src/routes/index.ts`
- [ ] Test all endpoints with Postman

### Phase 2: Frontend Setup (Week 2)

- [ ] Create React app
- [ ] Install dependencies
- [ ] Setup project structure
- [ ] Create `src/services/api.ts`
- [ ] Create `src/services/auth.api.ts`
- [ ] Create `src/context/AuthContext.tsx`
- [ ] Create `src/hooks/useAuth.ts`
- [ ] Create `src/types/auth.types.ts`
- [ ] Create `src/styles/variables.css`
- [ ] Create `src/styles/global.css`

### Phase 3: Frontend UI (Week 3)

- [ ] Create common components (Button, Input, Card, etc.)
- [ ] Create auth components (LoginForm, RegisterForm, etc.)
- [ ] Create auth pages (Login, Register, etc.)
- [ ] Create layout components (Header, Footer, Sidebar)
- [ ] Create protected pages (Dashboard, Settings)
- [ ] Setup routing in `App.tsx`
- [ ] Test all pages

### Phase 4: Integration & Testing (Week 4)

- [ ] Test registration flow
- [ ] Test email verification
- [ ] Test login flow
- [ ] Test password reset
- [ ] Test protected routes
- [ ] Test token refresh
- [ ] Test logout
- [ ] Test responsive design
- [ ] Fix any bugs

---

## 🧪 Testing Endpoints

### Test Registration

```bash
curl -X POST http://localhost:5000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Test Login

```bash
curl -X POST http://localhost:5000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### Test Protected Route

```bash
curl -X POST http://localhost:5000/v1/stages/intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "abstract": "Your research abstract..."
  }'
```

---

## 🐛 Common Issues & Solutions

### Issue: Prisma Client not found

**Solution**:
```bash
npx prisma generate
```

### Issue: Database connection error

**Solution**:
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists: `createdb literature_review`

### Issue: Email not sending

**Solution**:
- Check SMTP credentials
- For Gmail, use App Password, not regular password
- Check SMTP_HOST and SMTP_PORT

### Issue: CORS error in frontend

**Solution**:
- Add CORS middleware in backend
- Configure allowed origins
- Check FRONTEND_URL in backend .env

### Issue: Token expired

**Solution**:
- This is normal for access tokens (15 min)
- Frontend should automatically refresh
- Check refresh token logic

---

## 📚 Additional Resources

### Documentation
- **DATABASE.md** - Database schema details
- **AUTHENTICATION.md** - Auth system details
- **FRONTEND.md** - Frontend architecture
- **IMPLEMENTATION_PLAN.md** - Detailed implementation steps

### External Resources
- [Prisma Documentation](https://www.prisma.io/docs)
- [JWT.io](https://jwt.io) - JWT debugger
- [React Router](https://reactrouter.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

---

## 🎯 Success Criteria

You'll know you're done when:

### Backend
- ✅ User can register and receive email
- ✅ User can verify email
- ✅ User can login and get tokens
- ✅ User can reset password
- ✅ Protected routes require auth
- ✅ Token refresh works

### Frontend
- ✅ All pages render correctly
- ✅ Forms validate properly
- ✅ Auth flows work end-to-end
- ✅ Protected routes redirect to login
- ✅ Responsive on mobile, tablet, desktop
- ✅ UI looks modern and professional

---

## 🚀 Next Steps After Auth

Once authentication is working:

1. **Literature Review UI** - Create frontend for paper analysis
2. **Project Management** - Save and manage research projects
3. **Paper Management** - Save and organize papers
4. **Export Features** - Export to LaTeX, PDF, etc.
5. **Deployment** - Deploy to production

---

## 💡 Tips

1. **Start with backend** - Get auth working before frontend
2. **Test frequently** - Test each endpoint as you build it
3. **Use Prisma Studio** - Visual database browser (`npx prisma studio`)
4. **Use Postman** - Test API endpoints before building frontend
5. **Check logs** - Use Pino logger to debug issues
6. **Read docs** - Refer to detailed docs when stuck
7. **Commit often** - Use git to save progress
8. **Ask for help** - Refer to documentation or ask questions

---

## 📞 Need Help?

1. Check the detailed documentation in `documentation/`
2. Review the implementation plan
3. Check common issues section above
4. Review the code examples in the docs

---

**Good luck with implementation!** 🎉

Remember: Follow the implementation plan step by step, test frequently, and refer to the detailed documentation when needed.
