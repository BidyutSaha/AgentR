# Authentication API Testing Guide

Complete guide for testing all authentication endpoints with examples and expected responses.

---

## 📋 Table of Contents

1. [Setup](#setup)
2. [Environment](#environment)
3. [Public Endpoints](#public-endpoints)
4. [Protected Endpoints](#protected-endpoints)
5. [Error Scenarios](#error-scenarios)
6. [Testing Checklist](#testing-checklist)

---

## Setup

### Prerequisites

1. **Server Running**
   ```bash
   cd literature-review-backend
   npm run dev
   ```
   Server should be running on: `http://localhost:5000`

2. **Tools Needed**
   - Postman, Thunder Client, or cURL
   - Email access (for verification links)

3. **Environment Variables**
   - Ensure `.env` is configured
   - Database connected
   - Email SMTP configured

---

## Environment

### Base URL
```
http://localhost:5000/v1/auth
```

### Headers
```
Content-Type: application/json
Authorization: Bearer <access_token>  // For protected routes
```

---

## Public Endpoints

### 1. Register User

**Endpoint:** `POST /v1/auth/register`

**Request:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isVerified": false,
      "isActive": true,
      "createdAt": "2025-12-28T12:30:00.000Z",
      "updatedAt": "2025-12-28T12:30:00.000Z",
      "lastLogin": null
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "accessTokenExpiresIn": "15m",
      "refreshTokenExpiresIn": "7d"
    }
  },
  "message": "Registration successful. Please check your email to verify your account."
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**What Happens:**
1. User created in database
2. Verification email sent
3. Access & refresh tokens returned
4. User can use API but some features require verification

---

### 2. Login User

**Endpoint:** `POST /v1/auth/login`

**Request:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isVerified": true,
      "isActive": true,
      "createdAt": "2025-12-28T12:30:00.000Z",
      "updatedAt": "2025-12-28T12:30:00.000Z",
      "lastLogin": "2025-12-28T12:35:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "accessTokenExpiresIn": "15m",
      "refreshTokenExpiresIn": "7d"
    }
  },
  "message": "Login successful"
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

**Rate Limit:** 3 attempts per 15 minutes

---

### 3. Verify Email

**Endpoint:** `GET /v1/auth/verify-email?token=<verification_token>`

**Request:**
```
GET /v1/auth/verify-email?token=abc123def456...
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Email verified successfully"
  }
}
```

**cURL:**
```bash
curl -X GET "http://localhost:5000/v1/auth/verify-email?token=abc123def456..."
```

**What Happens:**
1. User marked as verified
2. Welcome email sent
3. Token marked as used

**Note:** Get the token from the verification email sent to the user.

---

### 4. Resend Verification Email

**Endpoint:** `POST /v1/auth/resend-verification`

**Request:**
```json
{
  "email": "john.doe@example.com"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Verification email sent"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/v1/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

**Rate Limit:** 10 attempts per hour

---

### 5. Forgot Password

**Endpoint:** `POST /v1/auth/forgot-password`

**Request:**
```json
{
  "email": "john.doe@example.com"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "If the email exists, a password reset link has been sent"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

**What Happens:**
1. Password reset token created
2. Reset email sent (if user exists)
3. Generic message returned (security)

**Rate Limit:** 3 attempts per hour

---

### 6. Reset Password

**Endpoint:** `POST /v1/auth/reset-password`

**Request:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset-token-from-email",
    "newPassword": "NewSecurePass123!"
  }'
```

**What Happens:**
1. Password updated
2. All refresh tokens revoked
3. User must login again

**Rate Limit:** 3 attempts per hour

---

### 7. Refresh Access Token

**Endpoint:** `POST /v1/auth/refresh`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "accessTokenExpiresIn": "15m",
      "refreshTokenExpiresIn": "7d"
    }
  },
  "message": "Tokens refreshed successfully"
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**What Happens:**
1. Old refresh token revoked
2. New access & refresh tokens issued
3. Token rotation for security

---

### 8. Logout

**Endpoint:** `POST /v1/auth/logout`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**What Happens:**
1. Refresh token revoked
2. Access token still valid until expiry
3. User should discard access token

---

## Protected Endpoints

These endpoints require authentication. Include the access token in the Authorization header.

### 9. Get User Profile

**Endpoint:** `GET /v1/auth/profile`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isVerified": true,
      "isActive": true,
      "createdAt": "2025-12-28T12:30:00.000Z",
      "updatedAt": "2025-12-28T12:30:00.000Z",
      "lastLogin": "2025-12-28T12:35:00.000Z"
    }
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:5000/v1/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 10. Change Password

**Endpoint:** `POST /v1/auth/change-password`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully. Please log in again."
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/v1/auth/change-password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "SecurePass123!",
    "newPassword": "NewSecurePass456!"
  }'
```

**What Happens:**
1. Current password verified
2. New password updated
3. All refresh tokens revoked
4. User must login again

---

## Error Scenarios

### 1. Validation Errors (400)

**Invalid Email:**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "errors": [
      {
        "field": "email",
        "message": "Invalid email address"
      }
    ]
  }
}
```

**Weak Password:**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "errors": [
      {
        "field": "password",
        "message": "Password must contain at least one uppercase letter"
      }
    ]
  }
}
```

---

### 2. Authentication Errors (401)

**Missing Token:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No authentication token provided"
  }
}
```

**Invalid Token:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid access token"
  }
}
```

**Expired Token:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Access token expired"
  }
}
```

---

### 3. Business Logic Errors (400)

**Email Already Exists:**
```json
{
  "success": false,
  "error": {
    "code": "REGISTRATION_FAILED",
    "message": "User with this email already exists"
  }
}
```

**Invalid Credentials:**
```json
{
  "success": false,
  "error": {
    "code": "LOGIN_FAILED",
    "message": "Invalid email or password"
  }
}
```

**Token Expired:**
```json
{
  "success": false,
  "error": {
    "code": "VERIFICATION_FAILED",
    "message": "Verification token has expired"
  }
}
```

---

### 4. Rate Limit Errors (429)

**Too Many Login Attempts:**
```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_LOGIN_ATTEMPTS",
    "message": "Too many login attempts. Please try again in 15 minutes."
  }
}
```

**Headers:**
```
RateLimit-Limit: 3
RateLimit-Remaining: 0
RateLimit-Reset: 1640707200
```

---

## Testing Checklist

### ✅ Registration Flow

- [ ] Register with valid data
- [ ] Receive verification email
- [ ] Get access & refresh tokens
- [ ] User created in database
- [ ] Cannot register with same email twice
- [ ] Weak password rejected
- [ ] Invalid email rejected

### ✅ Email Verification Flow

- [ ] Click verification link from email
- [ ] User marked as verified
- [ ] Receive welcome email
- [ ] Cannot use same token twice
- [ ] Expired token rejected
- [ ] Can resend verification email

### ✅ Login Flow

- [ ] Login with correct credentials
- [ ] Get access & refresh tokens
- [ ] Last login updated
- [ ] Wrong password rejected
- [ ] Non-existent email rejected
- [ ] Inactive account rejected
- [ ] Rate limiting works (3 attempts)

### ✅ Password Reset Flow

- [ ] Request password reset
- [ ] Receive reset email
- [ ] Reset password with token
- [ ] All sessions invalidated
- [ ] Must login again
- [ ] Cannot reuse reset token
- [ ] Expired token rejected

### ✅ Token Management

- [ ] Access token works for 15 minutes
- [ ] Access token expires after 15 minutes
- [ ] Refresh token gets new access token
- [ ] Old refresh token revoked on refresh
- [ ] Logout revokes refresh token
- [ ] Invalid refresh token rejected

### ✅ Protected Routes

- [ ] Profile requires authentication
- [ ] Change password requires authentication
- [ ] Invalid token rejected
- [ ] Expired token rejected
- [ ] Missing token rejected

### ✅ Rate Limiting

- [ ] Login limited to 3 attempts / 15 min
- [ ] Password reset limited to 3 / hour
- [ ] Verification limited to 10 / hour
- [ ] Rate limit headers present
- [ ] Rate limit resets after window

### ✅ Security

- [ ] Passwords hashed in database
- [ ] Tokens are JWTs
- [ ] Refresh tokens stored in database
- [ ] Email doesn't reveal if user exists
- [ ] HTTPS in production
- [ ] CORS configured properly

---

## Testing with Postman

### Import Collection

Create a Postman collection with these requests:

1. **Register** - POST /register
2. **Login** - POST /login
3. **Verify Email** - GET /verify-email
4. **Resend Verification** - POST /resend-verification
5. **Forgot Password** - POST /forgot-password
6. **Reset Password** - POST /reset-password
7. **Refresh Token** - POST /refresh
8. **Logout** - POST /logout
9. **Get Profile** - GET /profile (with auth)
10. **Change Password** - POST /change-password (with auth)

### Environment Variables

```
base_url: http://localhost:5000/v1/auth
access_token: (set after login)
refresh_token: (set after login)
```

### Auto-Save Tokens

In login request, add to Tests tab:
```javascript
const response = pm.response.json();
if (response.success) {
  pm.environment.set("access_token", response.data.tokens.accessToken);
  pm.environment.set("refresh_token", response.data.tokens.refreshToken);
}
```

---

## Quick Test Script

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/v1/auth"

# 1. Register
echo "1. Testing Registration..."
curl -X POST $BASE_URL/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#","firstName":"Test"}'

# 2. Login
echo "\n2. Testing Login..."
RESPONSE=$(curl -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}')

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.data.tokens.accessToken')

# 3. Get Profile
echo "\n3. Testing Get Profile..."
curl -X GET $BASE_URL/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"

echo "\n\nTests complete!"
```

---

## Troubleshooting

### Server Not Starting
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Check environment variables
node setup-tests/test-env.js
```

### Database Connection Issues
```bash
# Test database
npx prisma studio
```

### Email Not Sending
```bash
# Test email configuration
node setup-tests/test-email.js
```

### Token Issues
- Ensure JWT secrets are set in `.env`
- Check token hasn't expired
- Verify token format: `Bearer <token>`

---

## Next Steps

1. **Run all tests** using the checklist
2. **Document any issues** found
3. **Test edge cases** (expired tokens, etc.)
4. **Performance testing** (concurrent requests)
5. **Security testing** (SQL injection, XSS, etc.)

---

**Happy Testing!** 🧪

For more details, see:
- `AUTH_API_COMPLETE.md` - Complete API documentation
- `documentation/AUTHENTICATION.md` - Authentication system details
