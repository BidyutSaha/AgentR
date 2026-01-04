# API Documentation

Complete API reference for the Literature Review System.

**Base URL**: `http://localhost:5000/v1` (development)  
**Production URL**: TBD

---

## Table of Contents

### Authentication (Public)
1. [POST /auth/register](#post-v1authregister) - User registration
2. [POST /auth/login](#post-v1authlogin) - User login
3. [GET /auth/verify-email](#get-v1authverify-email) - Email verification
4. [POST /auth/resend-verification](#post-v1authresend-verification) - Resend verification
5. [POST /auth/forgot-password](#post-v1authforgot-password) - Request password reset
6. [POST /auth/reset-password](#post-v1authreset-password) - Reset password
7. [POST /auth/refresh](#post-v1authrefresh) - Refresh access token

### Authentication (Protected)
8. [POST /auth/change-password](#post-v1authchange-password) - Change password
9. [POST /auth/logout](#post-v1authlogout) - Logout

### User Projects (Protected)
10. [POST /v1/user-projects](#post-v1user-projects) - Create project
11. [GET /v1/user-projects/:id](#get-v1user-projectsid) - Get project by ID
12. [GET /v1/user-projects/user/:userId](#get-v1user-projectsuseruserid) - Get all user projects
13. [PATCH /v1/user-projects/:id](#patch-v1user-projectsid) - Update project
14. [DELETE /v1/user-projects/:id](#delete-v1user-projectsid) - Delete project

### Candidate Papers (Protected)
15. [POST /v1/user-projects/:projectId/papers](#post-v1user-projectsprojectidpapers) - Add paper to project
16. [GET /v1/user-projects/:projectId/papers](#get-v1user-projectsprojectidpapers) - Get all papers for project
17. [GET /v1/papers/:paperId](#get-v1paperspaperid) - Get single paper
18. [PATCH /v1/papers/:paperId](#patch-v1paperspaperid) - Update paper
19. [DELETE /v1/papers/:paperId](#delete-v1paperspaperid) - Delete paper

### LLM Pipeline (Protected)
20. [POST /v1/stages/intent](#post-v1stagesintent) - Stage 1: Intent decomposition
21. [POST /v1/stages/queries](#post-v1stagesqueries) - Stage 2: Query generation
22. [POST /v1/stages/score](#post-v1stagesscore) - Paper scoring

### LLM Usage Tracking - USD (Protected)
23. [GET /v1/llm-usage/my-usage](#get-v1llm-usagemy-usage) - Get my LLM usage (USD)
24. [GET /v1/llm-usage/project/:projectId](#get-v1llm-usageprojectprojectid) - Get project LLM usage (USD)
25. [GET /v1/llm-usage/admin/all-users](#get-v1llm-usageadminall-users) - Get all users billing (USD, admin)

### LLM Usage Tracking - AI Credits (Protected)
26. [GET /v1/llm-usage/my-usage-credits](#get-v1llm-usagemy-usage-credits) - Get my LLM usage (Credits)
27. [GET /v1/llm-usage/project-credits/:projectId](#get-v1llm-usageproject-creditsprojectid) - Get project LLM usage (Credits)
28. [GET /v1/llm-usage/wallet-transaction-history](#get-v1llm-usagewallet-transaction-history) - Wallet transaction history
29. [GET /v1/credits/my-balance](#get-v1creditsmy-balance) - Get my credits balance

### Model Pricing Management (Admin Only)
29. [POST /v1/admin/model-pricing](#post-v1adminmodel-pricing) - Create model pricing
30. [GET /v1/admin/model-pricing](#get-v1adminmodel-pricing) - List model pricing
31. [PATCH /v1/admin/model-pricing/:id](#patch-v1adminmodel-pricingid) - Update model pricing
32. [DELETE /v1/admin/model-pricing/:id](#delete-v1adminmodel-pricingid) - Delete model pricing

### Health Check (Public)
33. [GET /v1/health](#get-v1health) - Health check

### System Configuration (Admin Only)
34. [GET /v1/admin/system-config](#get-v1adminsystem-config) - Get system configuration
35. [POST /v1/admin/system-config/credits-multiplier](#post-v1adminsystem-configcredits-multiplier) - Update AI Credits multiplier
36. [GET /v1/admin/system-config/credits-multiplier/history](#get-v1adminsystem-configcredits-multiplierhistory) - Get multiplier history
37. [POST /v1/admin/system-config/default-credits](#post-v1adminsystem-configdefault-credits) - Update default credits
38. [GET /v1/admin/system-config/default-credits/history](#get-v1adminsystem-configdefault-creditshistory) - Get default credits history

### Credits Management (Admin Only)
39. [POST /v1/admin/credits/recharge](#post-v1admincreditsrecharge) - Recharge user credits
40. [POST /v1/admin/credits/deduct](#post-v1admincreditsdeduct) - Deduct user credits
41. [GET /v1/admin/credits/user/:userId](#get-v1admincreditsuseruserid) - Get user credits balance
42. [GET /v1/admin/credits/user/:userId/wallet-transaction-history](#get-v1admincreditsuseruseridwallet-transaction-history) - Wallet transaction history



---

## Authentication Endpoints

### POST /v1/auth/register

**Description**: Register a new user account with email verification.

**Authentication**: None (Public)  
**Roles**: Public

---

#### Input Structure

**Request Body**:
```typescript
{
  email: string;           // Valid email address
  password: string;        // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  firstName?: string;      // Optional first name
  lastName?: string;       // Optional last name
}
```

**Query Parameters**: None  
**Path Parameters**: None

---

#### Output Structure

**Success Response** (201 Created):
```typescript
{
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      isVerified: boolean;
      createdAt: string;      // ISO 8601 timestamp
    };
    message: string;
  };
}
```

---

#### Sample Request

```bash
POST /v1/auth/register
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

---

#### Sample Response

**Success (201 Created)**:
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
      "createdAt": "2025-12-31T12:00:00.000Z"
    },
    "message": "Registration successful. Please check your email to verify your account."
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input data | Email format invalid |
| 409 | `EMAIL_EXISTS` | Email already registered | User with this email exists |
| 500 | `INTERNAL_ERROR` | Server error | Database connection failed |

**Sample Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "An account with this email already exists",
    "details": {
      "field": "email",
      "value": "john.doe@example.com"
    }
  }
}
```

---

#### Diagrams

**Diagrams**: Not required (simple CRUD operation with email sending)

---

#### Business Logic Notes

- Password is hashed using bcrypt (cost factor: 12)
- Email verification token expires after 24 hours
- Verification email is sent asynchronously
- User account is created but `isVerified` is false until email verified

---

### POST /v1/auth/login

**Description**: Authenticate user and receive JWT tokens.

**Authentication**: None (Public)  
**Roles**: Public

---

#### Input Structure

**Request Body**:
```typescript
{
  email: string;           // Registered email address
  password: string;        // User password
}
```

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      isVerified: boolean;
    };
    tokens: {
      accessToken: string;   // JWT, expires in 15 minutes
      refreshToken: string;  // JWT, expires in 7 days
    };
  };
}
```

---

#### Sample Request

```bash
POST /v1/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isVerified": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input | Missing email or password |
| 401 | `INVALID_CREDENTIALS` | Wrong email/password | Incorrect password |
| 403 | `EMAIL_NOT_VERIFIED` | Email not verified | User must verify email first |
| 403 | `ACCOUNT_INACTIVE` | Account deactivated | User account is inactive |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

---

#### Diagrams

**Diagrams**: Not required (simple authentication operation)

---

#### Business Logic Notes

- Password is compared using bcrypt
- Access token expires in 15 minutes
- Refresh token expires in 7 days
- Last login timestamp is updated
- Refresh token is stored in database for tracking

---

### GET /v1/auth/verify-email

**Description**: Verify user email address using token from verification email.

**Authentication**: None (Public)  
**Roles**: Public

---

#### Input Structure

**Query Parameters**:
- `token` (string, required) — Email verification token from email

**Path Parameters**: None  
**Request Body**: None

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    message: string;
  };
}
```

---

#### Sample Request

```bash
GET /v1/auth/verify-email?token=abc123xyz789
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Email verified successfully. You can now log in."
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 400 | `INVALID_TOKEN` | Token is invalid | Token format incorrect |
| 400 | `TOKEN_EXPIRED` | Token has expired | Token older than 24 hours |
| 400 | `TOKEN_ALREADY_USED` | Token already used | Email already verified |
| 404 | `USER_NOT_FOUND` | User not found | User was deleted |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

---

#### Diagrams

**Diagrams**: Not required (simple token verification)

---

#### Business Logic Notes

    // Token is marked as used with timestamp
    // - User's isVerified flag is set to true
    
    // - Token is single-use only
    // - Token expires after 24 hours
    // - User's `isVerified` flag is set to true
    // - Token is marked as used with timestamp
    
    // The previous content ended at line 379. I will rewrite the Business Logic Notes for verify-email correctly and then append the new sections.

- Token is single-use only
- Token expires after 24 hours
- User's `isVerified` flag is set to true
- Token is marked as used with timestamp

---

### POST /v1/auth/resend-verification

**Description**: Resend the email verification link to the user.

**Authentication**: None (Public)  
**Roles**: Public

---

#### Input Structure

**Request Body**:
```typescript
{
  email: string;           // User email address
}
```

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    message: string;
  };
}
```

---

#### Sample Request

```bash
POST /v1/auth/resend-verification
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Verification email sent"
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input | Invalid email format |
| 400 | `RESEND_FAILED` | Processing error | Email already active |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

**Sample Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "RESEND_FAILED",
    "message": "Email is already verified"
  }
}
```

---

#### Diagrams

**Diagrams**: Not required (simple email trigger)

---

#### Business Logic Notes

- Rate limited (10 requests per hour)
- If email is already verified, returns error
- If email doesn't exist, returns success message to prevent user enumeration
- Invalidates any previous unused verification tokens

---

### POST /v1/auth/forgot-password

**Description**: Request a password reset link to be sent to email.

**Authentication**: None (Public)  
**Roles**: Public

---

#### Input Structure

**Request Body**:
```typescript
{
  email: string;           // User email address
}
```

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    message: string;
  };
}
```

---

#### Sample Request

```bash
POST /v1/auth/forgot-password
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Password reset email sent"
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input | Invalid email format |
| 400 | `FORGOT_PASSWORD_FAILED` | User not found | User with this email does not exist |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

---

#### Diagrams

**Diagrams**: Not required (simple email trigger)

---

#### Business Logic Notes

- Rate limited (3 requests per hour)
- If email doesn't exist, returns success message to prevent user enumeration
- Invalidates any previous unused reset tokens
- Token expires in 1 hour

---

### POST /v1/auth/reset-password

**Description**: Reset user password using a valid reset token.

**Authentication**: None (Public)  
**Roles**: Public

---

#### Input Structure

**Request Body**:
```typescript
{
  token: string;           // Reset token from email
  newPassword: string;     // New password (min 8 chars, strong)
}
```

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    message: string;
  };
}
```

---

#### Sample Request

```bash
POST /v1/auth/reset-password
Content-Type: application/json

{
  "token": "abc123xyz789...",
  "newPassword": "NewSecurePass123!"
}
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully"
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input | Password too weak |
| 400 | `RESET_PASSWORD_FAILED` | Reset failed | Invalid or expired token |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

---

#### Diagrams

**Diagrams**: Not required (simple update)

---

#### Business Logic Notes

- Rate limited (3 requests per hour)
- Token is single-use
- Revokes all existing user sessions (refresh tokens) upon success for security

---

### POST /v1/auth/refresh

**Description**: Refresh access token using a valid refresh token.

**Authentication**: None (Public - requires refresh token in body)  
**Roles**: Public

---

#### Input Structure

**Request Body**:
```typescript
{
  refreshToken: string;    // Valid refresh token
}
```

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    tokens: {
      accessToken: string;
      refreshToken: string;
      accessTokenExpiresIn: string;
      refreshTokenExpiresIn: string;
    };
    message: string;
  };
}
```

---

#### Sample Request

```bash
POST /v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "accessTokenExpiresIn": "15m",
      "refreshTokenExpiresIn": "7d"
    },
    "message": "Tokens refreshed successfully"
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input | Missing token |
| 401 | `REFRESH_FAILED` | Refresh failed | Invalid/Expired token |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

---

#### Diagrams

**Diagrams**: Not required (token exchange)

---

#### Business Logic Notes

- Rate limited (5 requests per 15 mins)
- Replaces the old refresh token with a new one (Rotation)
- Returns new short-lived access token

---

### POST /v1/auth/change-password

**Description**: Change password for a logged-in user.

**Authentication**: Required (JWT)  
**Roles**: Authenticated User

---

#### Input Structure

**Request Body**:
```typescript
{
  currentPassword: string; // Current password
  newPassword: string;     // New password
}
```

**Headers**:
- `Authorization: Bearer <accessToken>` (required)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    message: string;
  };
}
```

---

#### Sample Request

```bash
POST /v1/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully. Please log in again."
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input | Weak password |
| 400 | `CHANGE_PASSWORD_FAILED` | Change failed | Wrong current password |
| 401 | `UNAUTHORIZED` | Authentication failed | Missing/invalid token |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

---

#### Diagrams

**Diagrams**: Not required (simple update)

---

#### Business Logic Notes

- Rate limited (5 requests per 15 mins)
- Revokes all existing sessions (refresh tokens) for security

---

### POST /v1/auth/logout

**Description**: Logout user by revoking the refresh token.

**Authentication**: None (Public - requires refresh token)  
**Roles**: Public

---

#### Input Structure

**Request Body**:
```typescript
{
  refreshToken: string;    // Token to revoke
}
```

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    message: string;
  };
}
```

---

#### Sample Request

```bash
POST /v1/auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input | Missing token |
| 200 | `OK` | Logout success | Even if token invalid (idempotent) |

---

#### Diagrams

**Diagrams**: Not required (simple revocation)

---

#### Business Logic Notes

- Rate limited (5 requests per 15 mins)
- Always returns 200 OK even if token is invalid (security/ux)
- Permanently revokes the refresh token

---

## User Projects Endpoints

### POST /v1/user-projects

**Description**: Create a new research project for the authenticated user.

**Authentication**: Required (JWT)  
**Roles**: Authenticated User

---

#### Input Structure

**Request Body**:
```typescript
{
  projectName: string;     // Project name (1-255 characters)
  userIdea: string;        // Research idea/abstract (unlimited length)
}
```

**Headers**:
- `Authorization: Bearer <accessToken>` (required)

---

#### Output Structure

**Success Response** (201 Created):
```typescript
{
  success: true;
  data: {
    id: string;
    userId: string;
    projectName: string;
    userIdea: string;
    createdAt: string;      // ISO 8601 timestamp
    updatedAt: string;      // ISO 8601 timestamp
  };
}
```

---

#### Sample Request

```bash
POST /v1/user-projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "projectName": "AI-Powered Literature Review",
  "userIdea": "This research explores the use of large language models for automated literature review and research gap discovery in academic research."
}
```

---

#### Sample Response

**Success (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "proj_550e8400-e29b-41d4-a716-446655440000",
    "userId": "user_123e4567-e89b-12d3-a456-426614174000",
    "projectName": "AI-Powered Literature Review",
    "userIdea": "This research explores the use of large language models for automated literature review and research gap discovery in academic research.",
    "createdAt": "2025-12-31T12:00:00.000Z",
    "updatedAt": "2025-12-31T12:00:00.000Z"
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input | Project name too long |
| 401 | `UNAUTHORIZED` | Missing/invalid token | Token expired |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

---

#### Diagrams

**Diagrams**: Not required (simple CRUD operation)

---

#### Business Logic Notes

- `userId` is automatically extracted from JWT token
- Project is associated with authenticated user
- `userIdea` field supports unlimited text length
- Timestamps are automatically managed

---

### GET /v1/user-projects/:id

**Description**: Get a specific project by ID.

**Authentication**: Required (JWT)  
**Roles**: Authenticated User (must own the project)

---

#### Input Structure

**Path Parameters**:
- `:id` (string, required) — Project UUID

**Headers**:
- `Authorization: Bearer <accessToken>` (required)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    id: string;
    userId: string;
    projectName: string;
    userIdea: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

---

#### Sample Request

```bash
GET /v1/user-projects/proj_550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "proj_550e8400-e29b-41d4-a716-446655440000",
    "userId": "user_123e4567-e89b-12d3-a456-426614174000",
    "projectName": "AI-Powered Literature Review",
    "userIdea": "This research explores...",
    "createdAt": "2025-12-31T12:00:00.000Z",
    "updatedAt": "2025-12-31T12:00:00.000Z"
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 401 | `UNAUTHORIZED` | Missing/invalid token | Token expired |
| 403 | `FORBIDDEN` | Not project owner | User doesn't own this project |
| 404 | `NOT_FOUND` | Project not found | Invalid project ID |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

---

#### Diagrams

**Diagrams**: Not required (simple CRUD operation)

---

#### Business Logic Notes

- User can only access their own projects
- Authorization check ensures project belongs to authenticated user

---

### GET /v1/user-projects/user/:userId

**Description**: Get all projects belonging to a specific user.

**Authentication**: Required (JWT)  
**Roles**: Authenticated User (must match userId)

---

#### Input Structure

**Path Parameters**:
- `:userId` (string, required) — User UUID

**Headers**:
- `Authorization: Bearer <accessToken>` (required)

**Query Parameters**:
- `startDate` (string, optional) - Filter start date (ISO 8601, e.g. `2024-01-01`)
- `endDate` (string, optional) - Filter end date (ISO 8601, e.g. `2024-01-31`)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    totalCost: number;     // Total USD cost consumed by user in period
    projectCosts: Array<{
      projectId: string;
      projectName: string;
      totalCost: number;   // Cost for this project in period
    }>;
    paperCosts: Array<{
      paperId: string;
      paperTitle: string;
      projectId: string;
      totalCost: number;   // Cost for this paper in period
    }>;
  };
}
```

---

#### Sample Request

```bash
GET /v1/user-projects/user/user_123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "proj_550e8400-e29b-41d4-a716-446655440000",
        "userId": "user_123e4567-e89b-12d3-a456-426614174000",
        "projectName": "AI Research",
        "userIdea": "Investigating AI agents...",
        "createdAt": "2025-12-31T12:00:00.000Z",
        "updatedAt": "2025-12-31T12:00:00.000Z"
      }
    ],
    "count": 1
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 401 | `UNAUTHORIZED` | Missing/invalid token | Token expired |
| 403 | `FORBIDDEN` | Access denied | Accessing other user's projects |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

---

#### Diagrams

**Diagrams**: Not required (simple CRUD operation)

---

#### Business Logic Notes

- Users can only list their own projects
- Requesting another user's projects returns 403 Forbidden

---

### PATCH /v1/user-projects/:id

**Description**: Update an existing project details.

**Authentication**: Required (JWT)  
**Roles**: Authenticated User (must own the project)

---

#### Input Structure

**Path Parameters**:
- `:id` (string, required) — Project UUID

**Request Body**:
```typescript
{
  projectName?: string;  // Optional: max 100 chars
  userIdea?: string;     // Optional: max text length
}
```

**Headers**:
- `Authorization: Bearer <accessToken>` (required)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    project: UserProject;
  };
}
```

---

#### Sample Request

```bash
PATCH /v1/user-projects/proj_550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "projectName": "Updated AI Research"
}
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "proj_550e8400-e29b-41d4-a716-446655440000",
      "userId": "user_123e4567-e89b-12d3-a456-426614174000",
      "projectName": "Updated AI Research",
      "userIdea": "Investigating AI agents...",
      "createdAt": "2025-12-31T12:00:00.000Z",
      "updatedAt": "2025-12-31T13:00:00.000Z"
    }
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input | Project name too long |
| 401 | `UNAUTHORIZED` | Missing/invalid token | Token expired |
| 403 | `FORBIDDEN` | Not project owner | User doesn't own this project |
| 404 | `NOT_FOUND` | Project not found | Invalid project ID |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

---

#### Diagrams

**Diagrams**: Not required (simple CRUD operation)

---

#### Business Logic Notes

- Only provided fields are updated
- `updatedAt` is automatically refreshed
- User must own the project

---

### DELETE /v1/user-projects/:id

**Description**: Delete a project and all associated papers.

**Authentication**: Required (JWT)  
**Roles**: Authenticated User (must own the project)

---

#### Input Structure

**Path Parameters**:
- `:id` (string, required) — Project UUID

**Headers**:
- `Authorization: Bearer <accessToken>` (required)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    message: string;
  };
}
```

---

#### Sample Request

```bash
DELETE /v1/user-projects/proj_550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Project deleted successfully"
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 401 | `UNAUTHORIZED` | Missing/invalid token | Token expired |
| 403 | `FORBIDDEN` | Not project owner | User doesn't own this project |
| 404 | `NOT_FOUND` | Project not found | Invalid project ID |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

---

#### Diagrams

**Diagrams**: Not required (simple CRUD operation)

---

#### Business Logic Notes

- Permanently deletes valid project
- **CASCADE DELETE**: All candidate papers associated with this project are also deleted
- Cannot be undone

---

## Candidate Papers Endpoints

### POST /v1/user-projects/:projectId/papers

**Description**: Add a new candidate paper to a research project for analysis.

**Authentication**: Required (JWT)  
**Roles**: Authenticated User (must own the project)

---

#### Input Structure

**Path Parameters**:
- `:projectId` (string, required) — Project UUID

**Request Body**:
```typescript
{
  paperTitle: string;          // Paper title (1-500 characters)
  paperAbstract: string;       // Paper abstract (1-10000 characters)
  paperDownloadLink?: string;  // Optional download link (URL)
}
```

**Headers**:
- `Authorization: Bearer <accessToken>` (required)

---

#### Output Structure

**Success Response** (201 Created):
```typescript
{
  success: true;
  data: {
    paper: {
      id: string;
      projectId: string;
      paperTitle: string;
      paperAbstract: string;
      paperDownloadLink: string | null;
      isProcessedByLlm: boolean;           // false (default)
      semanticSimilarity: number | null;   // null (not yet processed)
      similarityModelName: string | null;  // null
      problemOverlap: string | null;       // null
      domainOverlap: string | null;        // null
      constraintOverlap: string | null;    // null
      c1Score: number | null;              // null
      c1Justification: string | null;      // null
      c1Strengths: string | null;          // null
      c1Weaknesses: string | null;         // null
      c2Score: number | null;              // null
      c2Justification: string | null;      // null
      c2ContributionType: string | null;   // null
      c2RelevanceAreas: string | null;     // null
      researchGaps: string | null;         // null
      userNovelty: string | null;          // null
      modelUsed: string | null;            // null
      inputTokensUsed: number | null;      // null
      outputTokensUsed: number | null;     // null
      processedAt: string | null;          // null
      createdAt: string;                   // ISO 8601 timestamp
      updatedAt: string;                   // ISO 8601 timestamp
    };
  };
}
```

---

#### Sample Request

```bash
POST /v1/user-projects/proj_550e8400-e29b-41d4-a716-446655440000/papers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "paperTitle": "Attention Is All You Need",
  "paperAbstract": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
  "paperDownloadLink": "https://arxiv.org/pdf/1706.03762"
}
```

---

#### Sample Response

**Success (201 Created)**:
```json
{
  "success": true,
  "data": {
    "paper": {
      "id": "paper_123e4567-e89b-12d3-a456-426614174000",
      "projectId": "proj_550e8400-e29b-41d4-a716-446655440000",
      "paperTitle": "Attention Is All You Need",
      "paperAbstract": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...",
      "paperDownloadLink": "https://arxiv.org/pdf/1706.03762",
      "isProcessedByLlm": false,
      "semanticSimilarity": null,
      "similarityModelName": null,
      "problemOverlap": null,
      "domainOverlap": null,
      "constraintOverlap": null,
      "c1Score": null,
      "c1Justification": null,
      "c1Strengths": null,
      "c1Weaknesses": null,
      "c2Score": null,
      "c2Justification": null,
      "c2ContributionType": null,
      "c2RelevanceAreas": null,
      "researchGaps": null,
      "userNovelty": null,
      "modelUsed": null,
      "inputTokensUsed": null,
      "outputTokensUsed": null,
      "processedAt": null,
      "createdAt": "2025-12-31T15:00:00.000Z",
      "updatedAt": "2025-12-31T15:00:00.000Z"
    }
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input data | Title too long |
| 401 | `UNAUTHORIZED` | Missing/invalid token | Token expired |
| 403 | `FORBIDDEN` | Not project owner | User doesn't own this project |
| 404 | `NOT_FOUND` | Project not found | Invalid project ID |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

**Sample Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Paper title must be between 1 and 500 characters",
    "details": {
      "field": "paperTitle",
      "constraint": "maxLength",
      "value": 500
    }
  }
}
```

---

#### Diagrams

**Diagrams**: Not required (simple CRUD operation)

---

#### Business Logic Notes

- Paper is created with basic info only (title, abstract, link)
- All LLM analysis fields are NULL until processing is triggered via `/process` endpoint
- `isProcessedByLlm` is false by default
- User must own the project to add papers
- `paperDownloadLink` is optional (can be null)
- Papers are automatically deleted when project is deleted (CASCADE)

---

### GET /v1/user-projects/:projectId/papers

**Description**: Get all candidate papers for a specific project.

**Authentication**: Required (JWT)  
**Roles**: Authenticated User (must own the project)

---

#### Input Structure

**Path Parameters**:
- `:projectId` (string, required) — Project UUID

**Query Parameters**: None

**Headers**:
- `Authorization: Bearer <accessToken>` (required)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    papers: Array<CandidatePaper>;  // Array of paper objects
    count: number;                   // Total number of papers
  };
}
```

---

#### Sample Request

```bash
GET /v1/user-projects/proj_550e8400-e29b-41d4-a716-446655440000/papers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "papers": [
      {
        "id": "paper_123e4567-e89b-12d3-a456-426614174000",
        "projectId": "proj_550e8400-e29b-41d4-a716-446655440000",
        "paperTitle": "Attention Is All You Need",
        "paperAbstract": "The dominant sequence transduction models...",
        "paperDownloadLink": "https://arxiv.org/pdf/1706.03762",
        "isProcessedByLlm": false,
        "semanticSimilarity": null,
        "createdAt": "2025-12-31T15:00:00.000Z",
        "updatedAt": "2025-12-31T15:00:00.000Z"
      },
      {
        "id": "paper_987f6543-e21c-34b5-d678-537825285111",
        "projectId": "proj_550e8400-e29b-41d4-a716-446655440000",
        "paperTitle": "BERT: Pre-training of Deep Bidirectional Transformers",
        "paperAbstract": "We introduce a new language representation model...",
        "paperDownloadLink": "https://arxiv.org/pdf/1810.04805",
        "isProcessedByLlm": true,
        "semanticSimilarity": 0.8547,
        "c1Score": 75.50,
        "c2Score": 85.25,
        "createdAt": "2025-12-31T14:00:00.000Z",
        "updatedAt": "2025-12-31T14:30:00.000Z"
      }
    ],
    "count": 2
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 401 | `UNAUTHORIZED` | Missing/invalid token | Token expired |
| 403 | `FORBIDDEN` | Not project owner | User doesn't own this project |
| 404 | `NOT_FOUND` | Project not found | Invalid project ID |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

---

#### Diagrams

**Diagrams**: Not required (simple CRUD operation)

---

#### Business Logic Notes

- Returns all papers for the project, ordered by creation date (newest first)
- Includes both processed and unprocessed papers
- User must own the project to view papers
- Empty array returned if project has no papers

---

### GET /v1/papers/:paperId

**Description**: Get a specific candidate paper by its ID (Simplified direct access).

**Authentication**: Required (JWT)  
**Roles**: Authenticated User (must own the project containing the paper)

---

#### Input Structure

**Path Parameters**:
- `:paperId` (string, required) — Paper UUID

**Headers**:
- `Authorization: Bearer <accessToken>` (required)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    paper: CandidatePaper;  // Full paper object with all fields
  };
}
```

---

#### Sample Request

```bash
GET /v1/papers/paper_123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "paper": {
      "id": "paper_123e4567-e89b-12d3-a456-426614174000",
      "projectId": "proj_550e8400-e29b-41d4-a716-446655440000",
      "paperTitle": "Attention Is All You Need",
      "paperAbstract": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...",
      "paperDownloadLink": "https://arxiv.org/pdf/1706.03762",
      "isProcessedByLlm": true,
      "semanticSimilarity": 0.8547,
      "similarityModelName": "text-embedding-ada-002",
      "problemOverlap": "high",
      "domainOverlap": "high",
      "constraintOverlap": "medium",
      "c1Score": 75.50,
      "c1Justification": "This paper presents a competing approach to sequence modeling...",
      "c1Strengths": "Novel architecture, strong empirical results, widely adopted",
      "c1Weaknesses": "Limited to sequence tasks, high computational cost",
      "c2Score": 85.25,
      "c2Justification": "Provides foundational techniques applicable to our research...",
      "c2ContributionType": "Methodological foundation",
      "c2RelevanceAreas": "Attention mechanisms, transformer architecture",
      "researchGaps": "Does not address multi-modal inputs, limited interpretability",
      "userNovelty": "Our work extends this to multi-modal scenarios with interpretability",
      "modelUsed": "gpt-4o-mini",
      "inputTokensUsed": 1250,
      "outputTokensUsed": 850,
      "processedAt": "2025-12-31T15:30:00.000Z",
      "createdAt": "2025-12-31T15:00:00.000Z",
      "updatedAt": "2025-12-31T15:30:00.000Z"
    }
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 401 | `UNAUTHORIZED` | Missing/invalid token | Token expired |
| 403 | `FORBIDDEN` | Not project owner | User doesn't own this project |
| 404 | `NOT_FOUND` | Paper or project not found | Invalid paper ID |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

---

#### Diagrams

**Diagrams**: Not required (simple CRUD operation)

---

#### Business Logic Notes

- This is a convenience alias for `GET /v1/user-projects/:projectId/papers/:paperId`
- It does not require `projectId` in the URL
- It automatically verifies that the logged-in user owns the project associated with this paper

---

### PATCH /v1/papers/:paperId

**Description**: Update a candidate paper by its ID (Simplified direct access).

**Authentication**: Required (JWT)  
**Roles**: Authenticated User (must own the project containing the paper)

---

#### Input Structure

**Path Parameters**:
- `:paperId` (string, required) — Paper UUID

**Request Body**:
```typescript
{
  // Basic fields
  paperTitle?: string;          // Optional: 1-500 characters
  paperAbstract?: string;       // Optional: 1-10000 characters
  paperDownloadLink?: string;   // Optional: valid URL or empty string

  // LLM analysis fields (can be updated manually or via LLM processing)
  isProcessedByLlm?: boolean;
  semanticSimilarity?: number;
  similarityModelName?: string;
  
  problemOverlap?: string;
  domainOverlap?: string;
  constraintOverlap?: string;
  
  c1Score?: number;
  c1Justification?: string;
  c1Strengths?: string | string[];    // Accepts string or array
  c1Weaknesses?: string | string[];
  
  c2Score?: number;
  c2Justification?: string;
  c2ContributionType?: string;
  c2RelevanceAreas?: string | string[];
  
  researchGaps?: string | string[];
  userNovelty?: string;
  
  modelUsed?: string;
  inputTokensUsed?: number;
  outputTokensUsed?: number;
}
```

**Headers**:
- `Authorization: Bearer <accessToken>` (required)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    paper: CandidatePaper;  // Updated paper object
  };
}
```

---

#### Sample Request

```bash
PATCH /v1/papers/paper_123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "paperTitle": "Updated Title",
  "c1Score": 8.5,
  "researchGaps": [
    "Gap 1: Missing multi-modal support",
    "Gap 2: Limited interpretability"
  ]
}
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "paper": {
      "id": "paper_123e4567-e89b-12d3-a456-426614174000",
      "projectId": "proj_550e8400-e29b-41d4-a716-446655440000",
      "paperTitle": "Updated Title",
      "paperAbstract": "The dominant sequence transduction models...",
      "paperDownloadLink": "https://arxiv.org/pdf/1706.03762",
      "isProcessedByLlm": true,
      "c1Score": 8.5,
      "researchGaps": "[\"Gap 1: Missing multi-modal support\",\"Gap 2: Limited interpretability\"]",
      "createdAt": "2025-12-31T15:00:00.000Z",
      "updatedAt": "2025-12-31T16:00:00.000Z"
    }
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input data | Title too long |
| 401 | `UNAUTHORIZED` | Missing/invalid token | Token expired |
| 403 | `FORBIDDEN` | Not paper owner | User doesn't own the parent project |
| 404 | `NOT_FOUND` | Paper not found | Invalid paper ID |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

---

#### Diagrams

**Diagrams**: Not required (simple CRUD operation)

---

#### Business Logic Notes

- This is a convenience alias for `PATCH /v1/user-projects/:projectId/papers/:paperId`
- It does not require `projectId` in the URL
- It automatically verifies that the logged-in user owns the project associated with this paper
- Array fields (like `researchGaps`, `c1Strengths`) are automatically converted to JSON strings for storage
- Only provided fields are updated; omitted fields remain unchanged
- `updatedAt` timestamp is automatically refreshed

---

### PATCH /v1/user-projects/:projectId/papers/:paperId

**Description**: Update basic information for a candidate paper (title, abstract, download link).

**Authentication**: Required (JWT)  
**Roles**: Authenticated User (must own the project)

---

#### Input Structure

**Path Parameters**:
- `:projectId` (string, required) — Project UUID
- `:paperId` (string, required) — Paper UUID

**Request Body** (all fields optional):
```typescript
{
  paperTitle?: string;          // Updated paper title (1-500 characters)
  paperAbstract?: string;       // Updated paper abstract (1-10000 characters)
  paperDownloadLink?: string;   // Updated download link (URL or empty string to remove)
}
```

**Headers**:
- `Authorization: Bearer <accessToken>` (required)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    paper: CandidatePaper;  // Updated paper object with all fields
  };
}
```

---

#### Sample Request

```bash
PATCH /v1/user-projects/proj_550e8400-e29b-41d4-a716-446655440000/papers/paper_123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "paperTitle": "Attention Is All You Need (Updated)",
  "paperAbstract": "Updated abstract with more details about the Transformer architecture...",
  "paperDownloadLink": "https://arxiv.org/pdf/1706.03762v7"
}
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "paper": {
      "id": "paper_123e4567-e89b-12d3-a456-426614174000",
      "projectId": "proj_550e8400-e29b-41d4-a716-446655440000",
      "paperTitle": "Attention Is All You Need (Updated)",
      "paperAbstract": "Updated abstract with more details about the Transformer architecture...",
      "paperDownloadLink": "https://arxiv.org/pdf/1706.03762v7",
      "isProcessedByLlm": false,
      "semanticSimilarity": null,
      "similarityModelName": null,
      "problemOverlap": null,
      "domainOverlap": null,
      "constraintOverlap": null,
      "c1Score": null,
      "c1Justification": null,
      "c1Strengths": null,
      "c1Weaknesses": null,
      "c2Score": null,
      "c2Justification": null,
      "c2ContributionType": null,
      "c2RelevanceAreas": null,
      "researchGaps": null,
      "userNovelty": null,
      "modelUsed": null,
      "inputTokensUsed": null,
      "outputTokensUsed": null,
      "processedAt": null,
      "createdAt": "2025-12-31T15:00:00.000Z",
      "updatedAt": "2025-12-31T16:30:00.000Z"
    }
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input data | Title too long |
| 401 | `UNAUTHORIZED` | Missing/invalid token | Token expired |
| 403 | `FORBIDDEN` | Not project owner | User doesn't own this project |
| 404 | `NOT_FOUND` | Paper or project not found | Invalid paper ID |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

**Sample Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Paper title must be between 1 and 500 characters",
    "details": {
      "field": "paperTitle",
      "constraint": "maxLength",
      "value": 500
    }
  }
}
```

---

#### Diagrams

**Diagrams**: Not required (simple CRUD operation)

---

#### Business Logic Notes

- Only basic paper information can be updated (title, abstract, link)
- **LLM analysis fields CANNOT be updated manually** - they are set via `/process` endpoint
- All fields in request body are optional - only provided fields are updated
- To remove download link, send empty string: `"paperDownloadLink": ""`
- User must own the project to update papers
- Paper must belong to the specified project
- `updatedAt` timestamp is automatically updated

---

### DELETE /v1/user-projects/:projectId/papers/:paperId

**Description**: Delete a candidate paper from a project.

**Authentication**: Required (JWT)  
**Roles**: Authenticated User (must own the project)

---

#### Input Structure

**Path Parameters**:
- `:projectId` (string, required) — Project UUID
- `:paperId` (string, required) — Paper UUID

**Headers**:
- `Authorization: Bearer <accessToken>` (required)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    message: string;  // "Paper deleted successfully"
  };
}
```

---

#### Sample Request

```bash
DELETE /v1/user-projects/proj_550e8400-e29b-41d4-a716-446655440000/papers/paper_123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Paper deleted successfully"
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 401 | `UNAUTHORIZED` | Missing/invalid token | Token expired |
| 403 | `FORBIDDEN` | Not project owner | User doesn't own this project |
| 404 | `NOT_FOUND` | Paper or project not found | Invalid paper ID |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

---

#### Diagrams

**Diagrams**: Not required (simple CRUD operation)

---

#### Business Logic Notes

- Permanently deletes the paper from the database
- User must own the project to delete papers
- Paper must belong to the specified project
- Cannot be undone

---











## LLM Pipeline Endpoints

### POST /v1/stages/intent

**Description**: Stage 1 - Decompose research abstract into structured intent components.

**Authentication**: Required (JWT)  
**Roles**: Authenticated User

---

#### Input Structure

**Request Body**:
```typescript
{
  abstract: string;        // Research abstract (max 5000 characters)
}
```

**Headers**:
- `Authorization: Bearer <accessToken>` (required)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    output: {
      abstract: string;
      problemStatement: string;
      proposedSolution: string;
      methodology: string;
      expectedContributions: string;
    };
  };
}
```

---

#### Sample Request

```bash
POST /v1/stages/intent
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "abstract": "This research proposes a novel approach to automated literature review using large language models. We aim to reduce the time researchers spend on manual paper screening by 80%."
}
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "output": {
      "abstract": "This research proposes a novel approach to automated literature review using large language models...",
      "problemStatement": "Researchers spend excessive time on manual paper screening and literature review",
      "proposedSolution": "Automated literature review system using large language models",
      "methodology": "LLM-based paper analysis and categorization",
      "expectedContributions": "80% reduction in literature review time"
    }
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input | Abstract too long |
| 401 | `UNAUTHORIZED` | Missing/invalid token | Token expired |
| 500 | `OPENAI_ERROR` | OpenAI API error | API rate limit exceeded |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

---

#### Diagrams

**Activity Diagram**: `documentation/diagrams/intent-decomposition-activity.puml`  
**Sequence Diagram**: `documentation/diagrams/intent-decomposition-sequence.puml`

These diagrams show:
- Complete workflow from user input to structured output
- OpenAI API integration
- Error handling paths (validation, rate limiting, API errors)
- Authentication flow

---

#### Business Logic Notes

- Uses OpenAI GPT-4o-mini model
- Structured prompt engineering for consistent output
- Response is cached for performance (TODO)
- Costs approximately $0.0001 per request


---

## LLM Usage Tracking Endpoints

### GET /v1/llm-usage/my-usage

**Description**: Get current user's LLM usage statistics and costs **in USD** for billing purposes.

**Authentication**: Required (JWT)  
**Roles**: Authenticated User

---

#### Input Structure

**Query Parameters**:
- `startDate` (string, optional) — ISO 8601 date string (e.g., "2025-01-01")
- `endDate` (string, optional) — ISO 8601 date string (e.g., "2025-01-31")

**Headers**:
- `Authorization: Bearer <accessToken>` (required)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    totalCostUsd: number;     // Total USD cost
    projectCosts: Array<{
      projectId: string;
      projectName: string;
      totalCostUsd: number;
    }>;
    paperCosts: Array<{
      paperId: string;
      paperTitle: string;
      projectId: string;
      totalCostUsd: number;
    }>;
  };
}
```

---

#### Sample Request

```bash
GET /v1/llm-usage/my-usage?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <token>
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "totalCostUsd": 0.45,
    "projectCosts": [
      {
        "projectId": "proj_123",
        "projectName": "My Research",
        "totalCostUsd": 0.30
      }
    ],
    "paperCosts": [
      {
        "paperId": "paper_xyz",
        "paperTitle": "Attention is All You Need",
        "projectId": "proj_123",
        "totalCostUsd": 0.15
      }
    ]
  }
}
```


---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 401 | `UNAUTHORIZED` | Missing/invalid token | Token expired |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

---

#### Diagrams

**Diagrams**: Not required (simple query operation)

---

#### Business Logic Notes

- **Date Filtering**:
  - If `startDate` is missing: No lower bound (includes usage from the beginning).
  - If `endDate` is missing: No upper bound (includes usage until now).
  - If both are missing: Returns lifetime total usage.
- Aggregates all historic usage for the user
- `totalCost` includes usage that may not be linked to any project (global usage)
- Returns all projects and papers, even if cost is 0
- Deleted projects/papers are excluded from the specific breakdown lists but included in `totalCost` if usage logs persist
- Useful for user billing dashboards

---

### GET /v1/llm-usage/project/:projectId

**Description**: Get LLM usage statistics for a specific project **in USD**.

**Authentication**: Required (JWT)  
**Roles**: Authenticated User (must own the project)

---

#### Input Structure

**Path Parameters**:
- `:projectId` (string, required) — Project UUID

**Query Parameters**:
- `startDate` (string, optional) — ISO 8601 date string
- `endDate` (string, optional) — ISO 8601 date string

**Headers**:
- `Authorization: Bearer <accessToken>` (required)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    logs: Array<LlmUsageLog>;
    summary: {
      totalCalls: number;
      totalTokens: number;
      totalCostUsd: number;     // Total USD cost
    };
  };
}
```

---

#### Sample Request

```bash
GET /v1/llm-usage/project/proj_550e8400-e29b-41d4-a716-446655440000?startDate=2025-01-01
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalCalls": 75,
      "totalTokens": 22500,
      "totalCostUsd": 0.62
    },
    "logs": [...]
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 401 | `UNAUTHORIZED` | Missing/invalid token | Token expired |
| 403 | `FORBIDDEN` | Not project owner | User doesn't own this project |
| 404 | `NOT_FOUND` | Project not found | Invalid project ID |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

---

#### Diagrams

**Diagrams**: Not required (simple query operation)

---

#### Business Logic Notes

- Returns LLM usage for a specific project only
- Useful for tracking costs per research project
- Can help identify which projects are most expensive
- **USD only** - for Credits, use `/v1/llm-usage/project-credits/:projectId`

---

### GET /v1/llm-usage/admin/all-users

**Description**: Get billing summary for all users **in USD** (admin only).

**Authentication**: Required (JWT)  
**Roles**: Admin

---

#### Input Structure

**Query Parameters**:
- `startDate` (string, optional) — ISO 8601 date string
- `endDate` (string, optional) — ISO 8601 date string

**Headers**:
- `Authorization: Bearer <accessToken>` (required)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    users: Array<{
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
      };
      totalCalls: number;
      totalTokens: number;
      totalCostUsd: number;     // Total USD cost for this user
    }>;
    totalUsers: number;
    grandTotalCostUsd: number;     // Sum of all users' USD costs
  };
}
```

---

#### Sample Request

```bash
GET /v1/llm-usage/admin/all-users?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "user": {
          "id": "user_123",
          "email": "john@example.com",
          "firstName": "John",
          "lastName": "Doe"
        },
        "totalCalls": 200,
        "totalTokens": 60000,
        "totalCostUsd": 1.80
      },
      {
        "user": {
          "id": "user_456",
          "email": "jane@example.com",
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "totalCalls": 125,
        "totalTokens": 37500,
        "totalCostUsd": 1.25
      }
    ],
    "totalUsers": 2,
    "grandTotalCostUsd": 3.05
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 401 | `UNAUTHORIZED` | Missing/invalid token | Token expired |
| 403 | `FORBIDDEN` | Not admin | User is not an admin |
| 500 | `INTERNAL_ERROR` | Server error | Database error |

---

#### Diagrams

**Diagrams**: Not required (simple query operation)

---

#### Business Logic Notes

- **Admin only** - requires admin role (TODO: implement admin middleware)
- Returns aggregated billing data for all users
- Useful for platform-wide cost monitoring
- Can be used to generate invoices or billing reports
- Helps identify high-usage users
- **USD only** - for Credits, use `/v1/llm-usage/admin/all-users-credits`

---

## LLM Usage Tracking - AI Credits (Protected)

### GET /v1/llm-usage/my-usage-credits

**Description**: Get current user's LLM usage statistics and costs **in AI Credits**.

**Authentication**: Required (JWT)  
**Roles**: Authenticated User

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    totalUsedCredits: number;
    projectUsedCredits: Array<{
      projectId: string;
      projectName: string;
      totalCostCredits: number;
    }>;
    paperUsedCredits: Array<{
      paperId: string;
      paperTitle: string;
      projectId: string;
      totalCostCredits: number;
    }>;
  }
}
```

---

### GET /v1/llm-usage/project-credits/:projectId

**Description**: Get LLM usage statistics for a specific project **in AI Credits**.

**Authentication**: Required (JWT)  
**Roles**: Authenticated User (must own project)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    summary: {
      totalCalls: number;
      totalTokens: number;
      totalCostCredits: number;
    };
  }
}
```

---

    };
  }
}
```

---



### GET /v1/llm-usage/wallet-transaction-history

**Description**: Wallet transaction history.

**Authentication**: Required (JWT)  
**Roles**: User

---

#### Input Structure

**Query Parameters**:
- `limit` (number, optional) — Max records to return (default: 50)
- `startDate` (string, optional) — Filter start date (ISO 8601)
- `endDate` (string, optional) — Filter end date (ISO 8601)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: Array<{
    id: string;
    transactionType: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    reason: string | null;
    description: string | null;
    createdAt: string;
  }>;
}
```

---

### GET /v1/credits/my-balance

**Description**: Get current logged-in user's credit balance.

**Authentication**: Required (JWT)  
**Roles**: User

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    balance: number;
  };
}
```

---

## Model Pricing Management (Admin Only)

### POST /v1/admin/model-pricing

**Description**: Create a new pricing configuration for an LLM model.

**Authentication**: Required (JWT)  
**Roles**: Admin

---

#### Input Structure

**Request Body**:
```typescript
{
  modelName: string;       // e.g., "gpt-4o"
  provider: string;        // e.g., "openai"
  pricingTier: string;     // e.g., "standard"
  inputUsdPricePerMillionTokens: number;
  outputUsdPricePerMillionTokens: number;
  cachedInputUsdPricePerMillionTokens?: number;
  effectiveFrom: string;   // ISO Date
}
```

---

### GET /v1/admin/model-pricing

**Description**: List all model pricing configurations.

**Authentication**: Required (JWT)  
**Roles**: Admin

---

### PATCH /v1/admin/model-pricing/:id

**Description**: Update an existing pricing configuration.

**Authentication**: Required (JWT)  
**Roles**: Admin

---

### DELETE /v1/admin/model-pricing/:id

**Description**: Delete a pricing configuration (soft delete or hard delete depending on implementation).

**Authentication**: Required (JWT)  
**Roles**: Admin

---

## Health Check

### GET /v1/health

**Description**: Check if the API server is running and healthy.

**Authentication**: None (Public)  
**Roles**: Public

---

#### Input Structure

**Query Parameters**: None  
**Path Parameters**: None  
**Request Body**: None

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    status: string;        // "ok"
    timestamp: string;     // ISO 8601 timestamp
    environment: string;   // "development" | "production"
    version: string;       // API version
  };
}
```

---

#### Sample Request

```bash
GET /v1/health
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-12-31T12:00:00.000Z",
    "environment": "development",
    "version": "1.0.0"
  }
}
```

---

#### Error Cases

None - If server is down, no response will be received.

---

#### Diagrams

**Diagrams**: Not required (simple health check)

---

## System Configuration (Admin Only)

### GET /v1/admin/system-config

**Description**: Get current system configuration including the active multiplier and default credits.

**Authentication**: Required (JWT)  
**Roles**: Admin

---

#### Input Structure

**Query Parameters**: None  
**Path Parameters**: None  
**Request Body**: None

**Headers**:
- `Authorization: Bearer <accessToken>` (required)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    usdToCreditsMultiplier: number;     // Active 1 USD = X Credits
    defaultCreditsForNewUsers: number;  // Active default signup credits
  };
}
```

---

#### Sample Request

```bash
GET /v1/admin/system-config
Authorization: Bearer <admin-token>
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "usdToCreditsMultiplier": 100.0,
    "defaultCreditsForNewUsers": 1000.0
  }
}
```

---

### POST /v1/admin/system-config/credits-multiplier

**Description**: Update the global USD to AI Credits multiplier (creates new history entry).

**Authentication**: Required (JWT)  
**Roles**: Admin

---

#### Input Structure

**Request Body**:
```typescript
{
  multiplier: number;      // Required: Must be > 0
  description?: string;    // Optional: Reason/Description
}
```

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    id: string;
    usdToCreditsMultiplier: number;
    description: string;
    updatedBy: string;
    effectiveFrom: string;
    isActive: true;
  };
  message: string;
}
```

---

### GET /v1/admin/system-config/credits-multiplier/history

**Description**: Get history of all multiplier changes.

**Authentication**: Required (JWT)  
**Roles**: Admin

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    current: number;
    history: Array<{
      id: string;
      usdToCreditsMultiplier: number;
      effectiveFrom: string;
      effectiveTo: string | null;
      isActive: boolean;
      updatedBy: string;
      description: string;
    }>;
  };
}
```

---

### POST /v1/admin/system-config/default-credits

**Description**: Update default credits for new users (creates new history entry).

**Authentication**: Required (JWT)  
**Roles**: Admin

---

#### Input Structure

**Request Body**:
```typescript
{
  credits: number;         // Required: Must be >= 0
  description?: string;    // Optional
}
```

---

### GET /v1/admin/system-config/default-credits/history

**Description**: Get history of default credits changes.

**Authentication**: Required (JWT)  
**Roles**: Admin

---

## Credits Management (Admin Only)

### POST /v1/admin/credits/recharge

**Description**: Recharge specific user's credit balance.

**Authentication**: Required (JWT)  
**Roles**: Admin

---

#### Input Structure

**Request Body**:
```typescript
{
  userId: string;          // Required
  amount: number;          // Required: Positive number
  reason?: string;         // Optional note
}
```

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    aiCreditsBalance: number;
    createdAt: string;
  };
  message: string;
}
```

---

#### Sample Request

```bash
POST /v1/admin/credits/recharge
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "userId": "user_123",
  "amount": 500,
  "reason": "Customer loyalty bonus"
}
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "aiCreditsBalance": 1500.0,
    "createdAt": "2026-01-01T10:00:00.000Z"
  },
  "message": "Recharged 500 credits successfully"
}
```

---

### POST /v1/admin/credits/deduct

**Description**: Deduct credits from specific user's balance.

**Authentication**: Required (JWT)  
**Roles**: Admin

---

#### Input Structure

**Request Body**:
```typescript
{
  userId: string;
  amount: number;          // Positive number (will be deducted)
  reason?: string;
}
```

---

#### Sample Request

```bash
POST /v1/admin/credits/deduct
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "userId": "user_123",
  "amount": 100,
  "reason": "Refund reversed"
}
```

---

### GET /v1/admin/credits/user/:userId

**Description**: Get a specific user's current credit balance.

**Authentication**: Required (JWT)  
**Roles**: Admin

---

### GET /v1/admin/credits/user/:userId/wallet-transaction-history

**Description**: Wallet transaction history (user).

**Authentication**: Required (JWT)  
**Roles**: Admin

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: Array<{
    id: string;
    transactionType: 'SIGNUP_DEFAULT' | 'ADMIN_RECHARGE' | 'ADMIN_DEDUCT' | 'ADMIN_ADJUSTMENT';
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    reason: string | null;
    description: string | null;
    adminId: string | null;
    createdAt: string;
  }>;
}
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "tx_2",
      "transactionType": "ADMIN_RECHARGE",
      "amount": 500,
      "balanceBefore": 1000,
      "balanceAfter": 1500,
      "reason": "Bonus",
      "description": "Admin recharge: +500 credits",
      "adminId": "admin_1",
      "createdAt": "2026-01-03T14:00:00.000Z"
    },
    {
      "id": "tx_1",
      "transactionType": "SIGNUP_DEFAULT",
      "amount": 1000,
      "balanceBefore": 0,
      "balanceAfter": 1000,
      "createdAt": "2026-01-01T10:00:00.000Z"
    }
  ]
}
```

---

### GET /v1/admin/credits/wallet-transaction-history

**Description**: Wallet transaction history (global).

**Authentication**: Required (JWT)  
**Roles**: Admin

---

#### Input Structure

**Query Parameters**:
- `limit` (number, optional) — Max records to return (default: 50)
- `startDate` (string, optional) — Filter start date (ISO 8601)
- `endDate` (string, optional) — Filter end date (ISO 8601)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: Array<{
    id: string;
    transactionType: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    reason: string | null;
    description: string | null;
    adminId: string | null;
    createdAt: string;
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
    };
  }>;
}
```

---





## Common Error Response Format

All error responses follow this structure:

```typescript
{
  success: false;
  error: {
    code: string;          // Machine-readable error code
    message: string;       // Human-readable error message
    details?: object;      // Optional additional context
  };
}
```

---

## Rate Limiting

- **Rate Limit**: 100 requests per 15 minutes per IP
- **Headers**:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

**Rate Limit Exceeded Response** (429):
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 900
    }
  }
}
```

---

## Authentication

### JWT Token Format

**Access Token** (Header):
```
Authorization: Bearer <accessToken>
```

**Token Payload**:
```typescript
{
  userId: string;
  email: string;
  iat: number;           // Issued at (Unix timestamp)
  exp: number;           // Expires at (Unix timestamp)
}
```

### Token Expiration

- **Access Token**: 15 minutes
- **Refresh Token**: 7 days
- **Email Verification Token**: 24 hours
- **Password Reset Token**: 1 hour

---

## Versioning

Current API version: **v1**

All endpoints are prefixed with `/v1/`

Future versions will use `/v2/`, `/v3/`, etc.

---

## CORS

Allowed origins (development):
- `http://localhost:3000`
- `http://localhost:5173`

Allowed methods:
- GET, POST, PATCH, DELETE, OPTIONS

Allowed headers:
- Content-Type, Authorization

---

## Additional Resources

- **Database Schema**: See [04_DATABASE.md](./04_DATABASE.md)
- **ER Diagram**: See [diagrams/database-er-diagram.puml](./diagrams/database-er-diagram.puml)
- **Testing Guide**: See [08_TESTING.md](./08_TESTING.md)
- **Troubleshooting**: See [07_TROUBLESHOOTING.md](./07_TROUBLESHOOTING.md)

---

**For endpoint implementation details, see the source code in `literature-review-backend/src/`**
