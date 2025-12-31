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
18. [PATCH /v1/user-projects/:projectId/papers/:paperId](#patch-v1user-projectsprojectidpaperspaperid) - Update paper
19. [DELETE /v1/user-projects/:projectId/papers/:paperId](#delete-v1user-projectsprojectidpaperspaperid) - Delete paper

### LLM Pipeline (Protected)
20. [POST /v1/stages/intent](#post-v1stagesintent) - Stage 1: Intent decomposition
21. [POST /v1/stages/queries](#post-v1stagesqueries) - Stage 2: Query generation
22. [POST /v1/stages/score](#post-v1stagesscore) - Paper scoring

### Health Check (Public)
23. [GET /v1/health](#get-v1health) - Health check

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
