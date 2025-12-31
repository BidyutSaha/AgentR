# Testing User Projects API

Complete testing guide for all User Projects endpoints with examples, expected responses, and test cases.

---

## 📋 Table of Contents

1. [Setup](#setup)
2. [Authentication](#authentication)
3. [Create Project](#1-create-project)
4. [Get All Projects](#2-get-all-projects)
5. [Get Project by ID](#3-get-project-by-id)
6. [Update Project](#4-update-project)
7. [Delete Project](#5-delete-project)
8. [Error Scenarios](#error-scenarios)
9. [Testing Checklist](#testing-checklist)

---

## Setup

### Prerequisites

1. **Server Running**
   ```bash
   cd literature-review-backend
   npm run dev
   ```
   Server should be running on: `http://localhost:5000`

2. **User Account**
   - Register and verify a user account
   - Login to get access token

3. **Tools**
   - Postman, Thunder Client, or cURL
   - Access token from login

---

## Authentication

### Get Access Token

**Login:**
```bash
POST http://localhost:5000/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!@#"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "..."
    }
  }
}
```

**Save the `accessToken`** - you'll need it for all project endpoints!

---

## 1. Create Project

### Endpoint
**POST** `/v1/user-projects/create-project`

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

### Request Body

**Minimal Example:**
```json
{
  "projectName": "My First Project",
  "userIdea": "This is my research idea about AI and machine learning."
}
```

**Detailed Example:**
```json
{
  "projectName": "AI-Powered Literature Review System",
  "userIdea": "Background:\nThe process of conducting literature reviews is time-consuming and requires extensive manual effort. Researchers spend countless hours reading, analyzing, and synthesizing information from numerous papers.\n\nResearch Questions:\n1. How can we automate the literature review process using AI?\n2. What are the key challenges in implementing such a system?\n3. How can we ensure the quality and accuracy of automated reviews?\n\nMethodology:\nThis research will employ natural language processing techniques, machine learning algorithms, and semantic analysis to develop an intelligent system capable of:\n- Extracting key information from research papers\n- Identifying research gaps automatically\n- Generating comprehensive literature review sections\n- Providing citation recommendations\n\nExpected Outcomes:\nThe system will significantly reduce the time required for literature reviews while maintaining high quality standards. It will help researchers focus on critical analysis rather than manual data collection.\n\nThis idea can be as long as needed - there's no character limit!"
}
```

### Expected Response (201)

```json
{
  "success": true,
  "data": {
    "project": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user-uuid-here",
      "projectName": "AI-Powered Literature Review System",
      "userIdea": "Background:\nThe process of conducting...",
      "createdAt": "2025-12-28T15:30:00.000Z",
      "updatedAt": "2025-12-28T15:30:00.000Z"
    }
  },
  "message": "Project created successfully"
}
```

### cURL Command

```bash
curl -X POST http://localhost:5000/v1/user-projects/create-project \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "My Research Project",
    "userIdea": "This is my detailed research idea that can be very long..."
  }'
```

### Validation Rules

- **projectName**: 
  - Required
  - 1-200 characters
  - Trimmed automatically

- **userIdea**:
  - Required
  - Minimum 10 characters
  - **No maximum length** (TEXT field)
  - Trimmed automatically

### Test Cases

**✅ Valid:**
```json
{
  "projectName": "Test",
  "userIdea": "Short idea"
}
```

**❌ Invalid - Missing projectName:**
```json
{
  "userIdea": "Just an idea"
}
```

**❌ Invalid - projectName too long:**
```json
{
  "projectName": "A".repeat(201),
  "userIdea": "Some idea"
}
```

**❌ Invalid - userIdea too short:**
```json
{
  "projectName": "Test",
  "userIdea": "Short"
}
```

---

## 2. Get All Projects

### Endpoint
**GET** `/v1/user-projects/my-projects`

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Request
No body required.

### Expected Response (200)

**With Projects:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "project-uuid-1",
        "userId": "user-uuid",
        "projectName": "Latest Project",
        "userIdea": "Most recent idea...",
        "createdAt": "2025-12-28T15:30:00.000Z",
        "updatedAt": "2025-12-28T15:30:00.000Z"
      },
      {
        "id": "project-uuid-2",
        "userId": "user-uuid",
        "projectName": "Older Project",
        "userIdea": "Earlier idea...",
        "createdAt": "2025-12-27T10:00:00.000Z",
        "updatedAt": "2025-12-27T10:00:00.000Z"
      }
    ],
    "total": 2
  }
}
```

**No Projects:**
```json
{
  "success": true,
  "data": {
    "projects": [],
    "total": 0
  }
}
```

### cURL Command

```bash
curl -X GET http://localhost:5000/v1/user-projects/my-projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Notes

- Projects are returned in **descending order** (newest first)
- Only returns projects owned by the authenticated user
- Other users' projects are not visible

---

## 3. Get Project by ID

### Endpoint
**GET** `/v1/user-projects/:projectId`

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### URL Parameters
- `projectId` - UUID of the project

### Request Example
```
GET http://localhost:5000/v1/user-projects/550e8400-e29b-41d4-a716-446655440000
```

### Expected Response (200)

```json
{
  "success": true,
  "data": {
    "project": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user-uuid",
      "projectName": "My Project",
      "userIdea": "Detailed research idea...",
      "createdAt": "2025-12-28T15:30:00.000Z",
      "updatedAt": "2025-12-28T15:30:00.000Z"
    }
  }
}
```

### cURL Command

```bash
curl -X GET http://localhost:5000/v1/user-projects/PROJECT_ID_HERE \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Error Responses

**404 - Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "GET_PROJECT_FAILED",
    "message": "Project not found or access denied"
  }
}
```

**400 - Invalid UUID:**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "errors": [
      {
        "field": "projectId",
        "message": "Invalid project ID format"
      }
    ]
  }
}
```

---

## 4. Update Project

### Endpoint
**PUT** `/v1/user-projects/:projectId`

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

### URL Parameters
- `projectId` - UUID of the project

### Request Body

**Update Both Fields:**
```json
{
  "projectName": "Updated Project Name",
  "userIdea": "Updated research idea with new insights..."
}
```

**Update Only Name:**
```json
{
  "projectName": "New Name"
}
```

**Update Only Idea:**
```json
{
  "userIdea": "Completely revised research idea..."
}
```

### Expected Response (200)

```json
{
  "success": true,
  "data": {
    "project": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user-uuid",
      "projectName": "Updated Project Name",
      "userIdea": "Updated research idea...",
      "createdAt": "2025-12-28T15:30:00.000Z",
      "updatedAt": "2025-12-28T16:00:00.000Z"
    }
  },
  "message": "Project updated successfully"
}
```

### cURL Command

```bash
curl -X PUT http://localhost:5000/v1/user-projects/PROJECT_ID_HERE \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Updated Name",
    "userIdea": "Updated idea"
  }'
```

### Validation Rules

- At least one field must be provided
- Fields follow same rules as create
- Only provided fields are updated

### Error Responses

**400 - No Fields Provided:**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "errors": [
      {
        "field": "",
        "message": "At least one field must be provided for update"
      }
    ]
  }
}
```

**404 - Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "UPDATE_PROJECT_FAILED",
    "message": "Project not found or access denied"
  }
}
```

---

## 5. Delete Project

### Endpoint
**DELETE** `/v1/user-projects/:projectId`

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### URL Parameters
- `projectId` - UUID of the project

### Request Example
```
DELETE http://localhost:5000/v1/user-projects/550e8400-e29b-41d4-a716-446655440000
```

### Expected Response (200)

```json
{
  "success": true,
  "data": {
    "message": "Project deleted successfully"
  }
}
```

### cURL Command

```bash
curl -X DELETE http://localhost:5000/v1/user-projects/PROJECT_ID_HERE \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Error Responses

**404 - Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "DELETE_PROJECT_FAILED",
    "message": "Project not found or access denied"
  }
}
```

### Notes

- Deletion is permanent
- Cannot be undone
- Only owner can delete their projects

---

## Error Scenarios

### 1. No Authentication Token

**Request:**
```bash
GET http://localhost:5000/v1/user-projects
# No Authorization header
```

**Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No authentication token provided"
  }
}
```

---

### 2. Invalid Token

**Request:**
```bash
GET http://localhost:5000/v1/user-projects
Authorization: Bearer invalid_token_here
```

**Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid access token"
  }
}
```

---

### 3. Expired Token

**Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Access token expired"
  }
}
```

**Solution:** Refresh your token:
```bash
POST http://localhost:5000/v1/auth/refresh
{
  "refreshToken": "your_refresh_token"
}
```

---

### 4. Access Another User's Project

**Request:**
```bash
GET http://localhost:5000/v1/user-projects/other-users-project-id
Authorization: Bearer YOUR_TOKEN
```

**Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "GET_PROJECT_FAILED",
    "message": "Project not found or access denied"
  }
}
```

---

### 5. Rate Limit Exceeded

**Response (429):**
```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Too many requests. Please try again later."
  }
}
```

**Rate Limit:** 100 requests per 15 minutes

---

## Testing Checklist

### ✅ Create Project

- [ ] Create project with valid data
- [ ] Create project with long userIdea (500+ words)
- [ ] Create project with minimal data
- [ ] Verify project appears in database
- [ ] Try creating without projectName (should fail)
- [ ] Try creating without userIdea (should fail)
- [ ] Try creating with projectName > 200 chars (should fail)
- [ ] Try creating with userIdea < 10 chars (should fail)
- [ ] Try creating without authentication (should fail)

### ✅ Get All Projects

- [ ] Get projects when user has none
- [ ] Get projects when user has one
- [ ] Get projects when user has multiple
- [ ] Verify projects are in descending order (newest first)
- [ ] Verify only user's projects are returned
- [ ] Try without authentication (should fail)

### ✅ Get Project by ID

- [ ] Get existing project
- [ ] Try getting non-existent project (should fail)
- [ ] Try getting another user's project (should fail)
- [ ] Try with invalid UUID format (should fail)
- [ ] Try without authentication (should fail)

### ✅ Update Project

- [ ] Update both fields
- [ ] Update only projectName
- [ ] Update only userIdea
- [ ] Verify updatedAt timestamp changes
- [ ] Try updating without any fields (should fail)
- [ ] Try updating non-existent project (should fail)
- [ ] Try updating another user's project (should fail)
- [ ] Try without authentication (should fail)

### ✅ Delete Project

- [ ] Delete existing project
- [ ] Verify project is removed from database
- [ ] Try deleting non-existent project (should fail)
- [ ] Try deleting another user's project (should fail)
- [ ] Try without authentication (should fail)

### ✅ Security

- [ ] All endpoints require authentication
- [ ] Users can only access their own projects
- [ ] Rate limiting works (100 requests / 15 min)
- [ ] Invalid tokens are rejected
- [ ] Expired tokens are rejected

### ✅ Data Integrity

- [ ] Timestamps are set correctly
- [ ] User ID is set correctly
- [ ] Long text (500+ words) is stored properly
- [ ] Special characters in text are handled
- [ ] Unicode characters are supported

---

## Complete Test Flow

### Scenario: Full CRUD Workflow

**1. Login**
```bash
POST /v1/auth/login
{
  "email": "test@example.com",
  "password": "Test123!@#"
}
# Save accessToken
```

**2. Create First Project**
```bash
POST /v1/user-projects
Authorization: Bearer TOKEN
{
  "projectName": "Project Alpha",
  "userIdea": "First research idea..."
}
# Save project ID
```

**3. Create Second Project**
```bash
POST /v1/user-projects
Authorization: Bearer TOKEN
{
  "projectName": "Project Beta",
  "userIdea": "Second research idea..."
}
```

**4. Get All Projects**
```bash
GET /v1/user-projects
Authorization: Bearer TOKEN
# Should return 2 projects, Beta first (newest)
```

**5. Get Specific Project**
```bash
GET /v1/user-projects/PROJECT_ALPHA_ID
Authorization: Bearer TOKEN
# Should return Project Alpha
```

**6. Update Project**
```bash
PUT /v1/user-projects/PROJECT_ALPHA_ID
Authorization: Bearer TOKEN
{
  "projectName": "Project Alpha - Updated"
}
# Should update name
```

**7. Delete Project**
```bash
DELETE /v1/user-projects/PROJECT_BETA_ID
Authorization: Bearer TOKEN
# Should delete Project Beta
```

**8. Verify Deletion**
```bash
GET /v1/user-projects
Authorization: Bearer TOKEN
# Should return only 1 project (Alpha)
```

---

## Postman Collection

### Import This Collection

Create a Postman collection with these requests:

1. **Login** - POST /v1/auth/login
2. **Create Project** - POST /v1/user-projects
3. **Get All Projects** - GET /v1/user-projects
4. **Get Project** - GET /v1/user-projects/:projectId
5. **Update Project** - PUT /v1/user-projects/:projectId
6. **Delete Project** - DELETE /v1/user-projects/:projectId

### Environment Variables

```
base_url: http://localhost:5000
access_token: (set after login)
project_id: (set after create)
```

### Auto-Save Token

In login request, add to Tests tab:
```javascript
const response = pm.response.json();
if (response.success) {
  pm.environment.set("access_token", response.data.tokens.accessToken);
}
```

### Auto-Save Project ID

In create project request, add to Tests tab:
```javascript
const response = pm.response.json();
if (response.success) {
  pm.environment.set("project_id", response.data.project.id);
}
```

---

## Database Verification

### Using Prisma Studio

1. Open Prisma Studio:
   ```bash
   npx prisma studio
   ```

2. Navigate to: `http://localhost:5555`

3. Click "UserProject" table

4. Verify:
   - Projects are created
   - User ID matches
   - Timestamps are correct
   - Long text is stored properly

### Using SQL

```sql
-- View all projects
SELECT * FROM user_projects;

-- View projects for specific user
SELECT * FROM user_projects WHERE user_id = 'USER_UUID';

-- Count projects per user
SELECT user_id, COUNT(*) as project_count
FROM user_projects
GROUP BY user_id;
```

---

## Troubleshooting

### Server Not Running
```bash
cd literature-review-backend
npm run dev
```

### Token Expired
```bash
# Refresh token
POST /v1/auth/refresh
{
  "refreshToken": "your_refresh_token"
}

# Or login again
POST /v1/auth/login
```

### Project Not Found
- Verify project ID is correct (UUID format)
- Ensure you own the project
- Check project exists in database (Prisma Studio)

### Validation Errors
- Check request body format
- Ensure all required fields are present
- Verify field lengths and constraints

---

## Next Steps

1. **Run all tests** using the checklist
2. **Document any issues** found
3. **Test with real data** (long research ideas)
4. **Performance testing** (create many projects)
5. **Integration testing** (with other features)

---

**Happy Testing!** 🧪

For more details, see:
- `documentation/USER_PROJECTS_API.md` - Complete API documentation
- `documentation/PROJECTS_API_SUMMARY.md` - Quick summary
