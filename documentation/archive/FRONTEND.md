# Frontend Documentation

## Overview

This document describes the responsive React + TypeScript frontend for the Literature Review System.

---

## Technology Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (fast, modern build tool)
- **Routing**: React Router v6
- **State Management**: React Context API + Custom Hooks
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod validation
- **Styling**: CSS Modules + Modern CSS Variables
- **Icons**: React Icons (optional) or SVG icons

---

## Project Structure

```
literature-review-frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.tsx                 # App entry point
│   ├── App.tsx                  # Root component with routing
│   │
│   ├── pages/                   # Page components
│   │   ├── public/              # Public pages (no auth required)
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── VerifyEmailPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   │
│   │   └── protected/           # Protected pages (auth required)
│   │       ├── DashboardPage.tsx
│   │       ├── LiteratureReviewPage.tsx
│   │       ├── ProjectsPage.tsx
│   │       └── SettingsPage.tsx
│   │
│   ├── components/              # Reusable components
│   │   ├── common/              # Generic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Spinner.tsx
│   │   │
│   │   ├── auth/                # Auth-specific components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── PasswordResetForm.tsx
│   │   │
│   │   ├── dashboard/           # Dashboard components
│   │   │   ├── ProjectCard.tsx
│   │   │   └── StatsCard.tsx
│   │   │
│   │   └── layout/              # Layout components
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       ├── Sidebar.tsx
│   │       └── ProtectedRoute.tsx
│   │
│   ├── context/                 # React Context providers
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── ThemeContext.tsx     # Theme (light/dark mode)
│   │
│   ├── services/                # API service layer
│   │   ├── api.ts               # Axios instance configuration
│   │   ├── auth.api.ts          # Auth API calls
│   │   └── stages.api.ts        # Literature review API calls
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts           # Authentication hook
│   │   ├── useApi.ts            # API call hook
│   │   └── useForm.ts           # Form handling hook
│   │
│   ├── utils/                   # Utility functions
│   │   ├── validation.ts        # Zod schemas
│   │   ├── storage.ts           # LocalStorage helpers
│   │   └── constants.ts         # App constants
│   │
│   ├── types/                   # TypeScript types
│   │   ├── auth.types.ts
│   │   └── api.types.ts
│   │
│   └── styles/                  # CSS files
│       ├── global.css           # Global styles
│       ├── variables.css        # CSS variables
│       └── components/          # Component-specific styles
│           ├── Button.module.css
│           ├── Input.module.css
│           └── ...
│
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Routing Structure

### Public Routes (No Authentication Required)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | LandingPage | Landing page with app overview |
| `/login` | LoginPage | User login form |
| `/register` | RegisterPage | User registration form |
| `/verify-email` | VerifyEmailPage | Email verification handler |
| `/forgot-password` | ForgotPasswordPage | Request password reset |
| `/reset-password` | ResetPasswordPage | Reset password with token |

### Protected Routes (Authentication Required)

| Path | Component | Description |
|------|-----------|-------------|
| `/dashboard` | DashboardPage | User dashboard overview |
| `/literature-review` | LiteratureReviewPage | Main literature review interface |
| `/projects` | ProjectsPage | Manage research projects |
| `/settings` | SettingsPage | Account settings |

---

## Authentication Flow

### 1. User Registration

**Page**: `/register`

**Features**:
- Registration form with validation
- Real-time password strength indicator
- Email format validation
- Terms of service checkbox
- Redirect to login after successful registration
- Display verification email sent message

**Form Fields**:
- Email (required, validated)
- Password (required, strength checked)
- Confirm Password (required, must match)
- First Name (optional)
- Last Name (optional)

### 2. Email Verification

**Page**: `/verify-email?token={token}`

**Features**:
- Automatic verification on page load
- Success message with redirect to login
- Error handling for invalid/expired tokens
- Resend verification email option

### 3. User Login

**Page**: `/login`

**Features**:
- Login form with email and password
- Remember me checkbox (optional)
- Forgot password link
- Redirect to dashboard after successful login
- Error messages for invalid credentials
- Email not verified warning

**Token Storage**:
- Access token stored in memory (React state)
- Refresh token stored in httpOnly cookie (if backend supports) or localStorage

### 4. Password Recovery

**Pages**: `/forgot-password` and `/reset-password`

**Forgot Password Features**:
- Email input form
- Success message (same for existing/non-existing emails)
- Link to login page

**Reset Password Features**:
- New password form
- Password strength indicator
- Token validation
- Success message with redirect to login

### 5. Protected Routes

**Component**: `ProtectedRoute`

**Features**:
- Check if user is authenticated
- Redirect to login if not authenticated
- Check if email is verified
- Automatic token refresh when access token expires
- Handle token expiration gracefully

---

## State Management

### AuthContext

**Provides**:
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}
```

**Usage**:
```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

### ThemeContext (Optional)

**Provides**:
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

---

## API Integration

### Axios Configuration

**Base Configuration** (`src/services/api.ts`):
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/v1/auth/refresh', { refreshToken });
        
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${data.data.tokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### Auth API Service

**File**: `src/services/auth.api.ts`

```typescript
import api from './api';

export const authApi = {
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  logout: async (refreshToken: string) => {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },
  
  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
  
  verifyEmail: async (token: string) => {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },
  
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
};
```

---

## Responsive Design

### Breakpoints

```css
/* variables.css */
:root {
  --breakpoint-mobile: 480px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1024px;
  --breakpoint-wide: 1440px;
}
```

### Mobile-First Approach

All components are designed mobile-first, then enhanced for larger screens:

```css
/* Mobile styles (default) */
.container {
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Responsive Components

- **Navigation**: Hamburger menu on mobile, full nav on desktop
- **Forms**: Single column on mobile, multi-column on desktop
- **Cards**: Stack on mobile, grid on tablet/desktop
- **Tables**: Horizontal scroll on mobile, full table on desktop

---

## Design System

### Color Palette

```css
:root {
  /* Primary Colors */
  --color-primary: #6366f1;
  --color-primary-dark: #4f46e5;
  --color-primary-light: #818cf8;
  
  /* Secondary Colors */
  --color-secondary: #8b5cf6;
  --color-secondary-dark: #7c3aed;
  --color-secondary-light: #a78bfa;
  
  /* Neutral Colors */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  
  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* Background */
  --color-background: #ffffff;
  --color-surface: #f9fafb;
  
  /* Text */
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-disabled: #9ca3af;
}

/* Dark Mode */
[data-theme="dark"] {
  --color-background: #111827;
  --color-surface: #1f2937;
  --color-text-primary: #f9fafb;
  --color-text-secondary: #d1d5db;
}
```

### Typography

```css
:root {
  /* Font Families */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Font Sizes */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  
  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

### Spacing

```css
:root {
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
  --spacing-3xl: 4rem;     /* 64px */
}
```

### Shadows

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

### Border Radius

```css
:root {
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-full: 9999px;  /* Fully rounded */
}
```

---

## Component Examples

### Button Component

```typescript
// src/components/common/Button.tsx
import React from 'react';
import styles from '../../styles/components/Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  className,
  ...props
}) => {
  return (
    <button
      className={`
        ${styles.button}
        ${styles[variant]}
        ${styles[size]}
        ${fullWidth ? styles.fullWidth : ''}
        ${className || ''}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <span className={styles.spinner} /> : children}
    </button>
  );
};
```

### Input Component

```typescript
// src/components/common/Input.tsx
import React, { forwardRef } from 'react';
import styles from '../../styles/components/Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className={styles.inputWrapper}>
        {label && (
          <label className={styles.label} htmlFor={props.id}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            ${styles.input}
            ${error ? styles.error : ''}
            ${className || ''}
          `}
          {...props}
        />
        {error && <span className={styles.errorText}>{error}</span>}
        {helperText && !error && (
          <span className={styles.helperText}>{helperText}</span>
        )}
      </div>
    );
  }
);
```

---

## Form Validation

### Using React Hook Form + Zod

```typescript
// src/utils/validation.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
```

### Form Component Example

```typescript
// src/components/auth/RegisterForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../../utils/validation';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export const RegisterForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: any) => {
    // Handle registration
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register('email')}
        label="Email"
        type="email"
        error={errors.email?.message as string}
      />
      
      <Input
        {...register('password')}
        label="Password"
        type="password"
        error={errors.password?.message as string}
      />
      
      <Input
        {...register('confirmPassword')}
        label="Confirm Password"
        type="password"
        error={errors.confirmPassword?.message as string}
      />
      
      <Button type="submit" isLoading={isSubmitting} fullWidth>
        Register
      </Button>
    </form>
  );
};
```

---

## Environment Variables

Create `.env.example`:

```env
VITE_API_URL=http://localhost:5000/v1
VITE_APP_NAME=Literature Review System
```

---

## Build and Deployment

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview  # Preview production build
```

### Environment-Specific Builds

```bash
# Production
VITE_API_URL=https://api.example.com npm run build

# Staging
VITE_API_URL=https://staging-api.example.com npm run build
```

---

## Accessibility

- ✅ Semantic HTML elements
- ✅ ARIA labels where needed
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ Screen reader friendly
- ✅ Color contrast compliance (WCAG AA)

---

## Performance Optimization

- ✅ Code splitting with React.lazy()
- ✅ Image optimization
- ✅ Lazy loading for images
- ✅ Memoization with React.memo()
- ✅ Virtual scrolling for large lists
- ✅ Debouncing for search inputs

---

## Testing (Future)

- Unit tests: Vitest
- Component tests: React Testing Library
- E2E tests: Playwright or Cypress

---

## Future Enhancements

1. **Dark Mode**: Full dark theme support
2. **Internationalization**: Multi-language support
3. **Progressive Web App**: Offline support
4. **Real-time Updates**: WebSocket integration
5. **Advanced Search**: Filters and sorting
6. **Export Features**: PDF/CSV export
7. **Collaboration**: Share projects with team members
