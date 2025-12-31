# Authentication System Documentation

## Overview

This document describes the authentication and authorization system for the Literature Review application.

---

## Authentication Flow

### 1. User Registration

**Endpoint**: `POST /v1/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** (201 Created):
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isVerified": false,
      "createdAt": "2025-12-28T10:00:00Z"
    },
    "message": "Registration successful. Please check your email to verify your account."
  },
  "meta": {
    "requestId": "req-123"
  }
}
```

**Process**:
1. Validate email format and password strength
2. Check if email already exists
3. Hash password using bcrypt (cost factor: 12)
4. Create user record with `isVerified: false`
5. Generate email verification token (24-hour expiration)
6. Send verification email
7. Return user data (without password hash)

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

### 2. Email Verification

**Endpoint**: `GET /v1/auth/verify-email?token={token}`

**Response** (200 OK):
```json
{
  "data": {
    "message": "Email verified successfully. You can now log in."
  },
  "meta": {
    "requestId": "req-124"
  }
}
```

**Process**:
1. Validate token format
2. Find token in database
3. Check if token is expired
4. Check if token is already used
5. Update user's `isVerified` to `true`
6. Mark token as used
7. Return success message

**Error Cases**:
- Token not found: 404
- Token expired: 400
- Token already used: 400

---

### 3. Resend Verification Email

**Endpoint**: `POST /v1/auth/resend-verification`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "data": {
    "message": "Verification email sent. Please check your inbox."
  },
  "meta": {
    "requestId": "req-125"
  }
}
```

**Process**:
1. Find user by email
2. Check if already verified
3. Invalidate old verification tokens
4. Generate new verification token
5. Send verification email
6. Return success message

---

### 4. User Login

**Endpoint**: `POST /v1/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isVerified": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "accessTokenExpiresIn": "15m",
      "refreshTokenExpiresIn": "7d"
    }
  },
  "meta": {
    "requestId": "req-126"
  }
}
```

**Process**:
1. Find user by email
2. Check if user exists and is active
3. Check if email is verified
4. Verify password using bcrypt
5. Generate access token (15-minute expiration)
6. Generate refresh token (7-day expiration)
7. Store refresh token in database
8. Update last login timestamp
9. Return user data and tokens

**Error Cases**:
- Invalid credentials: 401
- Email not verified: 403
- Account inactive: 403

---

### 5. Token Refresh

**Endpoint**: `POST /v1/auth/refresh`

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "accessTokenExpiresIn": "15m",
      "refreshTokenExpiresIn": "7d"
    }
  },
  "meta": {
    "requestId": "req-127"
  }
}
```

**Process**:
1. Verify refresh token signature
2. Check if token exists in database
3. Check if token is expired or revoked
4. Generate new access token
5. Generate new refresh token (token rotation)
6. Revoke old refresh token
7. Store new refresh token
8. Return new tokens

**Token Rotation**: Each refresh generates a new refresh token and revokes the old one for enhanced security.

---

### 6. Logout

**Endpoint**: `POST /v1/auth/logout`

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "data": {
    "message": "Logged out successfully"
  },
  "meta": {
    "requestId": "req-128"
  }
}
```

**Process**:
1. Verify access token
2. Revoke refresh token in database
3. Return success message

---

### 7. Password Reset Request

**Endpoint**: `POST /v1/auth/forgot-password`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "data": {
    "message": "If an account exists with this email, a password reset link has been sent."
  },
  "meta": {
    "requestId": "req-129"
  }
}
```

**Process**:
1. Find user by email (don't reveal if user exists)
2. If user exists:
   - Invalidate old reset tokens
   - Generate new reset token (1-hour expiration)
   - Send password reset email
3. Always return same success message (security)

**Security Note**: Always return the same message regardless of whether the email exists to prevent email enumeration attacks.

---

### 8. Password Reset Confirmation

**Endpoint**: `POST /v1/auth/reset-password`

**Request Body**:
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "data": {
    "message": "Password reset successfully. You can now log in with your new password."
  },
  "meta": {
    "requestId": "req-130"
  }
}
```

**Process**:
1. Validate token format
2. Find token in database
3. Check if token is expired or used
4. Validate new password strength
5. Hash new password
6. Update user's password
7. Mark token as used
8. Revoke all refresh tokens for this user
9. Return success message

---

### 9. Change Password (Authenticated)

**Endpoint**: `POST /v1/auth/change-password`

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request Body**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "data": {
    "message": "Password changed successfully"
  },
  "meta": {
    "requestId": "req-131"
  }
}
```

**Process**:
1. Verify access token
2. Verify current password
3. Validate new password strength
4. Hash new password
5. Update user's password
6. Revoke all refresh tokens except current one
7. Return success message

---

## JWT Token Structure

### Access Token Payload

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "type": "access",
  "iat": 1640000000,
  "exp": 1640000900
}
```

**Expiration**: 15 minutes

### Refresh Token Payload

```json
{
  "userId": "uuid",
  "type": "refresh",
  "tokenId": "uuid",
  "iat": 1640000000,
  "exp": 1640604800
}
```

**Expiration**: 7 days

---

## Protected Routes

All routes under `/v1/stages/*` and `/v1/dashboard/*` require authentication.

### Authentication Middleware

**Headers Required**:
```
Authorization: Bearer {accessToken}
```

**Process**:
1. Extract token from Authorization header
2. Verify token signature
3. Check token expiration
4. Extract user ID from token
5. Attach user to request object
6. Continue to route handler

**Error Responses**:
- No token provided: 401
- Invalid token: 401
- Expired token: 401
- User not found: 401
- Email not verified: 403

---

## Email Templates

### Verification Email

**Subject**: Verify Your Email Address

**Body**:
```
Hi {firstName},

Thank you for registering with Literature Review System!

Please verify your email address by clicking the link below:

{frontendUrl}/verify-email?token={verificationToken}

This link will expire in 24 hours.

If you didn't create this account, please ignore this email.

Best regards,
Literature Review Team
```

### Password Reset Email

**Subject**: Reset Your Password

**Body**:
```
Hi {firstName},

We received a request to reset your password.

Click the link below to reset your password:

{frontendUrl}/reset-password?token={resetToken}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email and your password will remain unchanged.

Best regards,
Literature Review Team
```

---

## Security Best Practices

### Password Security
- ✅ Bcrypt hashing with cost factor 12
- ✅ Strong password requirements enforced
- ✅ Never log or expose password hashes
- ✅ Rate limiting on login attempts

### Token Security
- ✅ Short-lived access tokens (15 minutes)
- ✅ Refresh token rotation
- ✅ Secure random token generation
- ✅ Token revocation on logout
- ✅ All tokens invalidated on password change

### Email Security
- ✅ Single-use verification tokens
- ✅ Time-limited tokens
- ✅ No email enumeration (same response for existing/non-existing emails)
- ✅ Secure token generation (crypto.randomBytes)

### API Security
- ✅ HTTPS only in production
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation (Zod)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS prevention

---

## Rate Limiting

Implement rate limiting to prevent abuse:

- **Registration**: 5 requests per hour per IP
- **Login**: 10 requests per 15 minutes per IP
- **Password Reset**: 3 requests per hour per IP
- **Email Verification**: 5 requests per hour per email

---

## Error Codes

| Code | Message | HTTP Status |
|------|---------|-------------|
| AUTH_001 | Invalid credentials | 401 |
| AUTH_002 | Email not verified | 403 |
| AUTH_003 | Account inactive | 403 |
| AUTH_004 | Token expired | 401 |
| AUTH_005 | Invalid token | 401 |
| AUTH_006 | Email already exists | 409 |
| AUTH_007 | Weak password | 400 |
| AUTH_008 | Invalid email format | 400 |
| AUTH_009 | Token already used | 400 |
| AUTH_010 | User not found | 404 |

---

## Testing

See `documentation/testing/TESTING_AUTH.md` for comprehensive authentication testing guide.

---

## Environment Variables

```env
# JWT Configuration
JWT_ACCESS_SECRET="your-access-secret-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="noreply@literaturereview.com"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# Security
BCRYPT_ROUNDS="12"
```

---

## Future Enhancements

1. **Two-Factor Authentication (2FA)**: Add TOTP-based 2FA
2. **OAuth Integration**: Google, GitHub login
3. **Session Management**: View and revoke active sessions
4. **Account Deletion**: Self-service account deletion
5. **Email Change**: Allow users to change email with verification
6. **Login History**: Track login attempts and locations
