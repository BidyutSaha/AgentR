# 🔐 How User ID is Automatically Set (No Manual Input Required)

## Question
**"When creating a project, you don't ask for userId in the request body. How does the system know which user is creating the project?"**

---

## Answer: JWT Authentication Magic! ✨

The user ID is **automatically extracted from the authentication token**. The user never needs to provide it manually.

---

## 📋 Complete Flow

### Step 1: User Logs In

**Request:**
```bash
POST /v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDM3NjAwMDAsImV4cCI6MTcwMzc2MDkwMH0.signature"
    }
  }
}
```

---

### Step 2: Token Contains User Information

The `accessToken` is a JWT (JSON Web Token) that contains encoded user information:

**Token Structure:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9  ← Header
.
eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDM3NjAwMDAsImV4cCI6MTcwMzc2MDkwMH0  ← Payload
.
signature  ← Signature
```

**Decoded Payload:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",  ← User ID is here!
  "email": "user@example.com",
  "iat": 1703760000,  // Issued at
  "exp": 1703760900   // Expires at (15 minutes later)
}
```

---

### Step 3: User Creates Project

**Request:**
```bash
POST /v1/projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "projectName": "My Research Project",
  "userIdea": "This is my research idea..."
}
```

**Notice:**
- ✅ `Authorization` header with token
- ✅ Only `projectName` and `userIdea` in body
- ❌ **NO `userId` in the request!**

---

### Step 4: Server Extracts User ID from Token

**Code Flow:**

#### 4.1 Authentication Middleware Runs First

**File:** `src/middlewares/auth.ts`

```typescript
export async function authenticate(req, res, next) {
    // 1. Extract token from Authorization header
    const token = extractToken(req);  // Gets "Bearer xxx" → "xxx"
    
    // 2. Verify and decode the token
    const payload = verifyAccessToken(token);
    // payload = { userId: "550e8400...", email: "user@example.com", ... }
    
    // 3. Get user from database
    const user = await prisma.user.findUnique({
        where: { id: payload.userId }  // ← userId from token!
    });
    
    // 4. Attach user info to request object
    req.user = user;
    req.userId = user.id;  // ← This is the magic!
    
    // 5. Continue to next middleware/controller
    next();
}
```

#### 4.2 Controller Uses req.userId

**File:** `src/controllers/project.controller.ts`

```typescript
export async function createProject(req, res) {
    // req.userId is already set by authenticate middleware!
    
    if (!req.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Get data from request body
    const data = req.body;  // { projectName, userIdea }
    
    // Create project with userId from token
    const project = await projectService.createProject(
        req.userId,  // ← From token, not from request body!
        data
    );
    
    res.json({ project });
}
```

#### 4.3 Service Creates Project

**File:** `src/services/projects/project.service.ts`

```typescript
export async function createProject(userId, data) {
    const project = await prisma.userProject.create({
        data: {
            userId,  // ← Automatically set!
            projectName: data.projectName,
            userIdea: data.userIdea,
        },
    });
    
    return project;
}
```

---

## 🔍 Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Logs In                                             │
│    POST /v1/auth/login                                      │
│    { email, password }                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Server Generates JWT Token                               │
│    Token contains: { userId, email, exp }                   │
│    Returns: { accessToken: "eyJhbGc..." }                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. User Creates Project                                     │
│    POST /v1/projects                                        │
│    Headers: Authorization: Bearer eyJhbGc...                │
│    Body: { projectName, userIdea }  ← NO userId!            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Authentication Middleware                                │
│    • Extracts token from header                             │
│    • Decodes token → { userId: "550e8400..." }              │
│    • Sets req.userId = "550e8400..."                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Controller                                               │
│    • Uses req.userId (from token)                           │
│    • Calls service with userId                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Database                                                 │
│    INSERT INTO user_projects                                │
│    (user_id, project_name, user_idea)                       │
│    VALUES ('550e8400...', 'My Project', 'Idea...')          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Benefits

### Why This Approach is Secure

**1. User Can't Fake Their Identity**
```bash
# ❌ User can't do this:
POST /v1/projects
{
  "userId": "someone-elses-id",  // Won't work!
  "projectName": "Fake Project"
}

# ✅ User ID comes from verified token, not request body
```

**2. Token is Cryptographically Signed**
- Token is signed with secret key
- Can't be modified without invalidating signature
- Server verifies signature on every request

**3. Token Has Expiration**
- Access tokens expire in 15 minutes
- Must refresh or login again
- Stolen tokens have limited lifetime

---

## 📝 Code Examples

### Example 1: Request Without userId

**What User Sends:**
```javascript
fetch('http://localhost:5000/v1/projects', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,  // ← Token here
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    projectName: 'My Project',
    userIdea: 'Research idea...'
    // NO userId field!
  })
});
```

**What Happens on Server:**
```typescript
// 1. Middleware extracts userId from token
authenticate(req, res, next) {
  const token = req.headers.authorization.split(' ')[1];
  const payload = jwt.verify(token, SECRET);
  req.userId = payload.userId;  // ← Set automatically!
  next();
}

// 2. Controller uses req.userId
createProject(req, res) {
  const userId = req.userId;  // ← From token!
  const { projectName, userIdea } = req.body;  // ← From request
  
  // Create project with userId from token
  const project = await createProject(userId, { projectName, userIdea });
}
```

---

### Example 2: Multiple Users, Same Endpoint

**User A (userId: "aaa-111"):**
```bash
POST /v1/projects
Authorization: Bearer TOKEN_A  # Contains userId: "aaa-111"
{
  "projectName": "Project A"
}
# Creates project with userId = "aaa-111"
```

**User B (userId: "bbb-222"):**
```bash
POST /v1/projects
Authorization: Bearer TOKEN_B  # Contains userId: "bbb-222"
{
  "projectName": "Project B"
}
# Creates project with userId = "bbb-222"
```

**Same endpoint, different users, automatic user ID!**

---

## 🎯 Key Takeaways

1. ✅ **User ID comes from JWT token**, not request body
2. ✅ **Token is in `Authorization` header**
3. ✅ **Middleware extracts and verifies token**
4. ✅ **Controller uses `req.userId`**
5. ✅ **User can't fake their identity**
6. ✅ **More secure than manual userId input**

---

## 🔧 Technical Details

### JWT Token Generation (Login)

**File:** `src/services/auth/token.service.ts`

```typescript
export function generateAccessToken(userId, email) {
  return jwt.sign(
    { userId, email },  // ← Payload with userId
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}
```

### JWT Token Verification (Every Request)

**File:** `src/services/auth/token.service.ts`

```typescript
export function verifyAccessToken(token) {
  const payload = jwt.verify(token, JWT_SECRET);
  return payload;  // { userId, email, iat, exp }
}
```

### Request Object Extension

**File:** `src/types/auth.ts`

```typescript
declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
      userId?: string;  // ← Added by middleware
    }
  }
}
```

---

## 📊 Comparison

### ❌ Manual userId (Insecure)

```bash
POST /v1/projects
{
  "userId": "550e8400...",  # User provides this
  "projectName": "Project"
}

# Problems:
# - User can fake userId
# - Can create projects for other users
# - No authentication
```

### ✅ Automatic userId (Secure)

```bash
POST /v1/projects
Authorization: Bearer eyJhbGc...  # Token contains userId
{
  "projectName": "Project"  # Only project data
}

# Benefits:
# - userId from verified token
# - Can't fake identity
# - Authenticated and authorized
```

---

## 🎓 Summary

**Question:** How does the system know which user is creating the project?

**Answer:** 
1. User logs in → Gets JWT token
2. Token contains userId (encrypted)
3. User sends token in `Authorization` header
4. Server decodes token → Extracts userId
5. Server uses userId to create project

**User never provides userId manually!** It's automatically extracted from the authenticated token. This is more secure and prevents users from creating projects under someone else's account.

---

**This is standard JWT authentication!** 🔐

The same pattern is used for all protected endpoints:
- Create project
- Get my projects
- Update project
- Delete project
- Get profile
- Change password

All of them use `req.userId` from the token, never from the request body!
