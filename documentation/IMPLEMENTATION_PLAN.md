# Implementation Plan: Authentication & Frontend

## Overview

This document outlines the implementation plan for adding user authentication, PostgreSQL database, and responsive React frontend to the Literature Review System.

---

## Phase 1: Database Setup (Backend)

### 1.1 Install Dependencies

```bash
cd literature-review-backend
npm install prisma @prisma/client bcrypt jsonwebtoken nodemailer
npm install -D @types/bcrypt @types/jsonwebtoken @types/nodemailer
```

### 1.2 Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Database schema
- `.env` - Environment variables (DATABASE_URL)

### 1.3 Create Prisma Schema

Edit `prisma/schema.prisma` with:
- User model
- EmailVerificationToken model
- PasswordResetToken model
- RefreshToken model
- UserProject model (future)
- SavedPaper model (future)

### 1.4 Create Database

```bash
# Create PostgreSQL database
createdb literature_review

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### 1.5 Create Database Configuration

Create `src/config/database.ts`:
- Initialize Prisma Client
- Export singleton instance
- Handle connection errors

---

## Phase 2: Authentication Services (Backend)

### 2.1 Create Utility Functions

**File**: `src/utils/crypto.ts`
- `generateToken()` - Generate secure random tokens
- `hashToken()` - Hash tokens for storage

**File**: `src/config/email.ts`
- Configure Nodemailer transport
- Email templates

### 2.2 Create Auth Types

**File**: `src/types/auth.ts`
- User types
- Token types
- Auth request/response types

### 2.3 Create Auth Services

**File**: `src/services/auth/password.service.ts`
- `hashPassword()` - Hash password with bcrypt
- `verifyPassword()` - Verify password
- `validatePasswordStrength()` - Check password requirements

**File**: `src/services/auth/token.service.ts`
- `generateAccessToken()` - Create JWT access token
- `generateRefreshToken()` - Create JWT refresh token
- `verifyAccessToken()` - Verify and decode access token
- `verifyRefreshToken()` - Verify and decode refresh token

**File**: `src/services/auth/email.service.ts`
- `sendVerificationEmail()` - Send email verification
- `sendPasswordResetEmail()` - Send password reset
- `sendWelcomeEmail()` - Send welcome email (optional)

**File**: `src/services/auth/auth.service.ts`
- `register()` - User registration logic
- `login()` - User login logic
- `verifyEmail()` - Email verification logic
- `requestPasswordReset()` - Password reset request
- `resetPassword()` - Password reset confirmation
- `changePassword()` - Change password (authenticated)
- `refreshTokens()` - Refresh access token
- `logout()` - Logout user

### 2.4 Create Auth Schemas

**File**: `src/services/auth/auth.schema.ts`
- Zod schemas for all auth endpoints
- Request validation schemas
- Response schemas

---

## Phase 3: Auth Middleware & Routes (Backend)

### 3.1 Create Auth Middleware

**File**: `src/middlewares/auth.ts`
- `authenticate` - Verify JWT token
- `requireVerifiedEmail` - Check email verification
- Extract user from token and attach to request

**File**: `src/middlewares/rateLimit.ts`
- Rate limiting for auth endpoints
- Different limits for different endpoints

### 3.2 Create Auth Controller

**File**: `src/controllers/auth.controller.ts`
- `register` - Handle registration
- `login` - Handle login
- `verifyEmail` - Handle email verification
- `resendVerification` - Resend verification email
- `forgotPassword` - Handle password reset request
- `resetPassword` - Handle password reset
- `changePassword` - Handle password change
- `refreshToken` - Handle token refresh
- `logout` - Handle logout

### 3.3 Create Auth Routes

**File**: `src/routes/auth.routes.ts`
- POST `/auth/register`
- POST `/auth/login`
- GET `/auth/verify-email`
- POST `/auth/resend-verification`
- POST `/auth/forgot-password`
- POST `/auth/reset-password`
- POST `/auth/change-password` (protected)
- POST `/auth/refresh`
- POST `/auth/logout` (protected)

### 3.4 Update Main Routes

**File**: `src/routes/index.ts`
- Add auth routes
- Protect existing stage routes with auth middleware

### 3.5 Update Environment Variables

**File**: `.env.example`
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/literature_review"

# JWT
JWT_ACCESS_SECRET="your-secret-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="noreply@literaturereview.com"

# Frontend
FRONTEND_URL="http://localhost:3000"

# Security
BCRYPT_ROUNDS="12"
```

---

## Phase 4: Dashboard & User Features (Backend)

### 4.1 Create Dashboard Controller

**File**: `src/controllers/dashboard.controller.ts`
- `getProfile` - Get user profile
- `updateProfile` - Update user profile
- `getStats` - Get user statistics

### 4.2 Create Dashboard Routes

**File**: `src/routes/dashboard.routes.ts`
- GET `/dashboard/profile`
- PUT `/dashboard/profile`
- GET `/dashboard/stats`

---

## Phase 5: Frontend Setup

### 5.1 Create React App with Vite

```bash
cd "c:\Users\Bidyut\Desktop\Paper Agent"
npm create vite@latest literature-review-frontend -- --template react-ts
cd literature-review-frontend
npm install
```

### 5.2 Install Frontend Dependencies

```bash
npm install react-router-dom axios react-hook-form @hookform/resolvers zod
npm install -D @types/node
```

### 5.3 Create Project Structure

Create folders:
- `src/pages/public/`
- `src/pages/protected/`
- `src/components/common/`
- `src/components/auth/`
- `src/components/layout/`
- `src/context/`
- `src/services/`
- `src/hooks/`
- `src/utils/`
- `src/types/`
- `src/styles/`

---

## Phase 6: Frontend Core Setup

### 6.1 Create API Configuration

**File**: `src/services/api.ts`
- Axios instance with base URL
- Request interceptor (add auth token)
- Response interceptor (handle token refresh)

### 6.2 Create Auth API Service

**File**: `src/services/auth.api.ts`
- All auth API calls
- Type-safe API methods

### 6.3 Create Auth Context

**File**: `src/context/AuthContext.tsx`
- Auth state management
- Login/logout/register methods
- Token refresh logic
- Persist auth state

### 6.4 Create Auth Hook

**File**: `src/hooks/useAuth.ts`
- Hook to access auth context
- Type-safe auth operations

### 6.5 Create Types

**File**: `src/types/auth.types.ts`
- User type
- Auth response types
- Token types

---

## Phase 7: Frontend Design System

### 7.1 Create CSS Variables

**File**: `src/styles/variables.css`
- Color palette
- Typography
- Spacing
- Shadows
- Border radius
- Breakpoints

### 7.2 Create Global Styles

**File**: `src/styles/global.css`
- Reset styles
- Base typography
- Utility classes

### 7.3 Create Common Components

**Components to create:**
- `Button.tsx` + `Button.module.css`
- `Input.tsx` + `Input.module.css`
- `Card.tsx` + `Card.module.css`
- `Modal.tsx` + `Modal.module.css`
- `Spinner.tsx` + `Spinner.module.css`

---

## Phase 8: Frontend Auth Pages

### 8.1 Create Validation Schemas

**File**: `src/utils/validation.ts`
- Zod schemas for forms
- Password strength validation
- Email validation

### 8.2 Create Auth Components

**File**: `src/components/auth/LoginForm.tsx`
- Login form with validation
- Error handling
- Remember me option

**File**: `src/components/auth/RegisterForm.tsx`
- Registration form
- Password strength indicator
- Terms acceptance

**File**: `src/components/auth/PasswordResetForm.tsx`
- Password reset request form
- Password reset confirmation form

### 8.3 Create Auth Pages

**File**: `src/pages/public/LandingPage.tsx`
- Hero section
- Features overview
- Call to action

**File**: `src/pages/public/LoginPage.tsx`
- Login form
- Links to register and forgot password

**File**: `src/pages/public/RegisterPage.tsx`
- Registration form
- Link to login

**File**: `src/pages/public/VerifyEmailPage.tsx`
- Email verification handler
- Success/error messages

**File**: `src/pages/public/ForgotPasswordPage.tsx`
- Forgot password form

**File**: `src/pages/public/ResetPasswordPage.tsx`
- Reset password form

---

## Phase 9: Frontend Protected Pages

### 9.1 Create Protected Route Component

**File**: `src/components/layout/ProtectedRoute.tsx`
- Check authentication
- Redirect to login if not authenticated
- Check email verification

### 9.2 Create Layout Components

**File**: `src/components/layout/Header.tsx`
- Navigation
- User menu
- Logout button

**File**: `src/components/layout/Sidebar.tsx`
- Navigation links
- Responsive (hamburger on mobile)

**File**: `src/components/layout/Footer.tsx`
- Footer content

### 9.3 Create Dashboard Page

**File**: `src/pages/protected/DashboardPage.tsx`
- Welcome message
- User statistics
- Recent projects
- Quick actions

### 9.4 Create Settings Page

**File**: `src/pages/protected/SettingsPage.tsx`
- Profile settings
- Change password
- Email preferences

---

## Phase 10: Frontend Routing

### 10.1 Setup React Router

**File**: `src/App.tsx`
- Configure routes
- Public routes
- Protected routes
- 404 page

**Routes:**
```typescript
/ - LandingPage
/login - LoginPage
/register - RegisterPage
/verify-email - VerifyEmailPage
/forgot-password - ForgotPasswordPage
/reset-password - ResetPasswordPage

Protected:
/dashboard - DashboardPage
/literature-review - LiteratureReviewPage
/projects - ProjectsPage
/settings - SettingsPage
```

---

## Phase 11: Responsive Design

### 11.1 Mobile-First CSS

- All components mobile-first
- Media queries for tablet/desktop
- Touch-friendly UI elements

### 11.2 Responsive Navigation

- Hamburger menu on mobile
- Full navigation on desktop
- Smooth transitions

### 11.3 Responsive Forms

- Single column on mobile
- Multi-column on desktop
- Proper spacing and sizing

---

## Phase 12: Testing & Documentation

### 12.1 Create Auth Testing Guide

**File**: `documentation/testing/TESTING_AUTH.md`
- Test all auth endpoints
- Test email verification flow
- Test password reset flow
- Test protected routes

### 12.2 Update Documentation

- Update STATUS.md
- Update SETUP.md
- Add deployment guide

### 12.3 Manual Testing

- Test registration flow
- Test login flow
- Test email verification
- Test password reset
- Test protected routes
- Test token refresh
- Test logout
- Test responsive design on multiple devices

---

## Phase 13: Security Hardening

### 13.1 Security Checklist

- ✅ Password hashing with bcrypt
- ✅ JWT token security
- ✅ HTTPS only in production
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation
- ✅ SQL injection prevention (Prisma)
- ✅ XSS prevention
- ✅ CSRF protection (if needed)

### 13.2 Environment Security

- Secure secrets in .env
- Never commit .env to git
- Use strong JWT secrets (32+ characters)
- Use environment-specific configs

---

## Phase 14: Deployment Preparation

### 14.1 Backend Deployment

- Setup production database
- Configure environment variables
- Setup email service (SendGrid, AWS SES, etc.)
- Setup logging and monitoring
- Configure CORS for production frontend URL

### 14.2 Frontend Deployment

- Build production bundle
- Configure production API URL
- Setup CDN (optional)
- Configure domain and SSL

---

## Implementation Order

### Week 1: Backend Foundation
1. ✅ Database setup (Phase 1)
2. ✅ Auth services (Phase 2)
3. ✅ Auth middleware & routes (Phase 3)

### Week 2: Backend Features & Frontend Setup
4. ✅ Dashboard features (Phase 4)
5. ✅ Frontend setup (Phase 5)
6. ✅ Frontend core (Phase 6)

### Week 3: Frontend UI
7. ✅ Design system (Phase 7)
8. ✅ Auth pages (Phase 8)
9. ✅ Protected pages (Phase 9)

### Week 4: Integration & Testing
10. ✅ Routing (Phase 10)
11. ✅ Responsive design (Phase 11)
12. ✅ Testing (Phase 12)
13. ✅ Security (Phase 13)

### Week 5: Deployment
14. ✅ Deployment (Phase 14)

---

## Success Criteria

### Backend
- ✅ User can register and receive verification email
- ✅ User can verify email and login
- ✅ User can request password reset and reset password
- ✅ JWT tokens work correctly with refresh
- ✅ Protected routes require authentication
- ✅ All auth endpoints have proper validation
- ✅ Rate limiting works

### Frontend
- ✅ Responsive design works on mobile, tablet, desktop
- ✅ All auth flows work end-to-end
- ✅ Protected routes redirect to login
- ✅ Token refresh happens automatically
- ✅ Forms have proper validation and error messages
- ✅ UI is modern and professional
- ✅ Accessibility standards met

### Integration
- ✅ Frontend and backend communicate correctly
- ✅ CORS configured properly
- ✅ Error handling works across stack
- ✅ Loading states and user feedback
- ✅ Email delivery works

---

## Next Steps After Authentication

1. **Literature Review UI**: Create frontend for literature review pipeline
2. **Project Management**: Allow users to save and manage projects
3. **Paper Management**: Save and organize papers
4. **Export Features**: Export results to LaTeX, PDF, etc.
5. **Collaboration**: Share projects with other users
6. **Advanced Features**: Search history, recommendations, etc.

---

## Notes

- Follow the documentation in `DATABASE.md`, `AUTHENTICATION.md`, and `FRONTEND.md`
- Keep security as top priority
- Write clean, maintainable code
- Test thoroughly at each phase
- Update documentation as you go
- Use TypeScript for type safety
- Follow React best practices
- Keep components small and focused
- Use proper error handling everywhere
