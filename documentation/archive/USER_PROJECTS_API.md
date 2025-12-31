# 📁 User Projects API - Complete!

## ✅ What Was Created

A complete CRUD API for user projects where users can store their research ideas/abstracts.

---

## 📊 Database Schema

### UserProject Table

**Table name:** `user_projects`

**Columns:**
- `id` - UUID (primary key)
- `user_id` - Foreign key to users table
- `project_name` - Project name (string, max 200 chars)
- `user_idea` - User's research idea/abstract (TEXT field, unlimited length)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Relations:**
- Belongs to User (cascade delete - if user deleted, projects deleted)

---

## 🚀 API Endpoints

### Base URL: `/v1/projects`

All endpoints require authentication (`Authorization: Bearer <access_token>`)

---

### 1. Create Project

**POST** `/v1/projects`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "projectName": "AI-Powered Literature Review System",
  "userIdea": "This research aims to develop an intelligent system that automates the literature review process using natural language processing and machine learning. The system will analyze research papers, identify gaps, and generate comprehensive review sections..."
}
```

**Validation:**
- `projectName`: Required, 1-200 characters
- `userIdea`: Required, minimum 10 characters, no maximum length

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user-uuid",
      "projectName": "AI-Powered Literature Review System",
      "userIdea": "This research aims to...",
      "createdAt": "2025-12-28T15:00:00.000Z",
      "updatedAt": "2025-12-28T15:00:00.000Z"
    }
  },
  "message": "Project created successfully"
}
```

**Error Responses:**
- `401` - Unauthorized (no token or invalid token)
- `400` - Validation error

---

### 2. Get All User Projects

**GET** `/v1/projects`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "project-uuid-1",
        "userId": "user-uuid",
        "projectName": "AI Literature Review",
        "userIdea": "Research idea...",
        "createdAt": "2025-12-28T15:00:00.000Z",
        "updatedAt": "2025-12-28T15:00:00.000Z"
      },
      {
        "id": "project-uuid-2",
        "userId": "user-uuid",
        "projectName": "Machine Learning Survey",
        "userIdea": "Another research idea...",
        "createdAt": "2025-12-27T10:00:00.000Z",
        "updatedAt": "2025-12-27T10:00:00.000Z"
      }
    ],
    "total": 2
  }
}
```

**Notes:**
- Returns projects in descending order (newest first)
- Only returns projects owned by the authenticated user

---

### 3. Get Project by ID

**GET** `/v1/projects/:projectId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `projectId` - UUID of the project

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user-uuid",
      "projectName": "AI Literature Review",
      "userIdea": "Research idea...",
      "createdAt": "2025-12-28T15:00:00.000Z",
      "updatedAt": "2025-12-28T15:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Project not found or access denied
- `400` - Invalid project ID format

---

### 4. Update Project

**PUT** `/v1/projects/:projectId`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**URL Parameters:**
- `projectId` - UUID of the project

**Request Body:**
```json
{
  "projectName": "Updated Project Name",
  "userIdea": "Updated research idea..."
}
```

**Notes:**
- Both fields are optional
- At least one field must be provided
- Only updates provided fields

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user-uuid",
      "projectName": "Updated Project Name",
      "userIdea": "Updated research idea...",
      "createdAt": "2025-12-28T15:00:00.000Z",
      "updatedAt": "2025-12-28T16:00:00.000Z"
    }
  },
  "message": "Project updated successfully"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Project not found or access denied
- `400` - Validation error or no fields provided

---

### 5. Delete Project

**DELETE** `/v1/projects/:projectId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `projectId` - UUID of the project

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Project deleted successfully"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Project not found or access denied

---

## 🧪 Testing Examples

### Using cURL

**1. Create Project:**
```bash
curl -X POST http://localhost:5000/v1/projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "My Research Project",
    "userIdea": "This project explores the use of AI in literature review automation. The goal is to reduce the time researchers spend on manual paper analysis by leveraging natural language processing and machine learning techniques."
  }'
```

**2. Get All Projects:**
```bash
curl -X GET http://localhost:5000/v1/projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**3. Get Specific Project:**
```bash
curl -X GET http://localhost:5000/v1/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**4. Update Project:**
```bash
curl -X PUT http://localhost:5000/v1/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Updated Project Name"
  }'
```

**5. Delete Project:**
```bash
curl -X DELETE http://localhost:5000/v1/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔒 Security Features

✅ **Authentication Required** - All endpoints require valid access token  
✅ **Authorization** - Users can only access their own projects  
✅ **Rate Limiting** - 100 requests per 15 minutes  
✅ **Input Validation** - Zod schema validation on all inputs  
✅ **SQL Injection Protection** - Prisma ORM prevents SQL injection  
✅ **Cascade Delete** - Projects deleted when user is deleted  

---

## 📝 Files Created

### Database
1. ✅ `prisma/schema.prisma` - Updated with UserProject model

### Types
2. ✅ `src/types/project.ts` - TypeScript types

### Services
3. ✅ `src/services/projects/project.schema.ts` - Validation schemas
4. ✅ `src/services/projects/project.service.ts` - Business logic

### Controllers & Routes
5. ✅ `src/controllers/project.controller.ts` - Request handlers
6. ✅ `src/routes/project.routes.ts` - API endpoints
7. ✅ `src/routes/index.ts` - Updated with project routes

---

## 🎯 User Flow

### Complete Workflow

**1. User Registers & Logs In**
```
POST /v1/auth/register
POST /v1/auth/login
→ Get access token
```

**2. User Creates Project**
```
POST /v1/projects
{
  "projectName": "My Research",
  "userIdea": "500+ words of research idea..."
}
→ Project created with ID
```

**3. User Views Projects**
```
GET /v1/projects
→ List of all user's projects
```

**4. User Updates Project**
```
PUT /v1/projects/:id
{
  "userIdea": "Updated idea..."
}
→ Project updated
```

**5. User Deletes Project**
```
DELETE /v1/projects/:id
→ Project deleted
```

---

## 💡 Use Cases

### Research Project Management

**Scenario:** User has multiple research projects

```javascript
// Create projects for different research areas
POST /v1/projects
{
  "projectName": "AI in Healthcare",
  "userIdea": "Exploring machine learning applications..."
}

POST /v1/projects
{
  "projectName": "Blockchain Security",
  "userIdea": "Analyzing security vulnerabilities..."
}

// View all projects
GET /v1/projects
// Returns both projects
```

### Long Research Abstracts

**Scenario:** User has detailed research proposal

```javascript
POST /v1/projects
{
  "projectName": "Comprehensive ML Survey",
  "userIdea": `
    Background:
    Machine learning has revolutionized...
    
    Research Questions:
    1. How can we improve...
    2. What are the limitations...
    
    Methodology:
    We will conduct a systematic review...
    
    Expected Outcomes:
    This research will contribute...
    
    (Can be 500+ words or more - no limit!)
  `
}
```

---

## 🔧 Next Steps

### To Use the API:

**1. Restart Server** (to load new routes)
```bash
# Stop current server (Ctrl+C)
npm run dev
```

**2. Login to Get Token**
```bash
POST /v1/auth/login
{
  "email": "your@email.com",
  "password": "yourpassword"
}
```

**3. Create Your First Project**
```bash
POST /v1/projects
Authorization: Bearer <your_token>
{
  "projectName": "Test Project",
  "userIdea": "This is my research idea..."
}
```

**4. View in Prisma Studio**
```bash
npx prisma studio
# Open http://localhost:5555
# Click "UserProject" table
```

---

## ✨ Features

✅ **Unlimited Text Length** - userIdea field is TEXT type  
✅ **User Isolation** - Each user sees only their projects  
✅ **Automatic Timestamps** - createdAt and updatedAt tracked  
✅ **Cascade Delete** - Projects deleted with user  
✅ **Full CRUD** - Create, Read, Update, Delete  
✅ **Validation** - Input validation on all endpoints  
✅ **Error Handling** - Clear error messages  
✅ **Type Safety** - Full TypeScript support  

---

**Your User Projects API is ready to use!** 🎉

The server will auto-reload with the new routes. Just restart it to apply the changes!
