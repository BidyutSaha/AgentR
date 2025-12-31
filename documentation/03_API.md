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

### LLM Pipeline (Protected)
15. [POST /v1/stages/intent](#post-v1stagesintent) - Stage 1: Intent decomposition
16. [POST /v1/stages/queries](#post-v1stagesqueries) - Stage 2: Query generation
17. [POST /v1/stages/score](#post-v1stagesscore) - Paper scoring

### Health Check (Public)
18. [GET /v1/health](#get-v1health) - Health check

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

- Token is single-use only
- Token expires after 24 hours
- User's `isVerified` flag is set to true
- Token is marked as used with timestamp

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

**Activity Diagram**: `docs/diagrams/intent-decomposition-activity.puml` (TODO)  
**Sequence Diagram**: `docs/diagrams/intent-decomposition-sequence.puml` (TODO)

> Note: Diagrams should be created as this involves LLM processing

---

#### Business Logic Notes

- Uses OpenAI GPT-4o-mini model
- Structured prompt engineering for consistent output
- Response is cached for performance (TODO)
- Costs approximately $0.0001 per request

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
