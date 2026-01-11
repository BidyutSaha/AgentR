# Postman Collection Setup Guide

**Collection File**: `documentation/postman-collection-complete.json`  
**Environment File**: `documentation/postman-environment-complete.json`

This guide shows you how to import and use the **complete** Postman collection for testing all 52 API endpoints.

---

## Quick Start (3 Steps)

### Step 1: Import Collection

1. Open **Postman**
2. Click **"Import"** button (top left)
3. Drag and drop `postman-collection-complete.json` OR click **"Upload Files"**
4. Click **"Import"**

### Step 2: Import Environment

1. Click **"Import"** again
2. Drag and drop `postman-environment-complete.json`
3. Click **"Import"**

### Step 3: Select Environment

1. Click the **environment dropdown** (top right)
2. Select **"Literature Review - Development (Complete)"**
3. ✅ You're ready to test all 52 endpoints!

---

## Collection Structure

```
Literature Review System API - Complete (52 endpoints)
├── 📁 Authentication (10 requests)
│   ├── Register User
│   ├── Login
│   ├── Verify Email
│   ├── Resend Verification
│   ├── Forgot Password
│   ├── Reset Password
│   ├── Refresh Token
│   ├── Get Profile
│   ├── Change Password
│   └── Logout
│
├── 📁 User Projects (7 requests)
│   ├── Create Project
│   ├── Get My Projects
│   ├── Get Projects by User ID
│   ├── Get Project by ID
│   ├── Update Project
│   ├── Delete Project
│   └── Export Project Report
│
├── 📁 Candidate Papers (7 requests)
│   ├── Add Paper to Project
│   ├── Get Project Papers
│   ├── Bulk Upload Papers (CSV)
│   ├── Download CSV Template
│   ├── Get Paper by ID
│   ├── Update Paper
│   └── Delete Paper
│
├── 📁 Background Jobs (3 requests)
│   ├── Get User Jobs
│   ├── Resume Failed Job
│   └── Resume All Failed Jobs
│
├── 📁 LLM Pipeline (3 requests)
│   ├── Stage 1 - Intent Decomposition
│   ├── Stage 2 - Query Generation
│   └── Paper Scoring
│
├── 📁 LLM Usage Tracking (6 requests)
│   ├── Get My LLM Usage (USD)
│   ├── Get Project LLM Usage (USD)
│   ├── Get All Users Billing (Admin)
│   ├── Get My LLM Usage (Credits)
│   ├── Get Project LLM Usage (Credits)
│   └── Get Wallet Transaction History
│
├── 📁 Credits (1 request)
│   └── Get My Credits Balance
│
├── 📁 Admin - Model Pricing (4 requests)
│   ├── Create Model Pricing
│   ├── List Model Pricing
│   ├── Update Model Pricing
│   └── Delete Model Pricing
│
├── 📁 Admin - System Config (5 requests)
│   ├── Get System Configuration
│   ├── Update Credits Multiplier
│   ├── Get Multiplier History
│   ├── Update Default Credits
│   └── Get Default Credits History
│
├── 📁 Admin - Credits Management (5 requests)
│   ├── Recharge User Credits
│   ├── Deduct User Credits
│   ├── Get User Credits Balance
│   ├── Get User Wallet Transaction History
│   └── Get Global Wallet Transaction History
│
└── 📁 Health Check (1 request)
    └── Health Check
```

**Total**: **52 requests** organized in **11 folders**

---

## Environment Variables

The environment file includes these variables:

| Variable | Description | Auto-Set | Example |
|----------|-------------|----------|---------|
| `baseUrl` | API base URL | ❌ | `http://localhost:5000` |
| `accessToken` | JWT access token | ✅ (on login) | `eyJhbGci...` |
| `refreshToken` | JWT refresh token | ✅ (on login) | `eyJhbGci...` |
| `userId` | Current user ID | ✅ (on register/login) | `550e8400-...` |
| `projectId` | Current project ID | ✅ (on create project) | `proj_550e...` |
| `paperId` | Current paper ID | ✅ (on add paper) | `paper_550...` |
| `jobId` | Current job ID | ✅ (on create project) | `job_550e...` |
| `scoringJobId` | Scoring job ID | ✅ (on add paper) | `job_999e...` |
| `pricingId` | Model pricing ID | ✅ (on create pricing) | `pricing_...` |
| `userEmail` | Test user email | ❌ | `test@example.com` |
| `userPassword` | Test user password | ❌ | `Test123!` |
| `verificationToken` | Email verification token | ❌ | `verify_...` |
| `resetToken` | Password reset token | ❌ | `reset_...` |

**✅ Auto-Set** = Automatically updated by test scripts  
**❌ Manual** = You can edit these values

---

## Testing Workflows

### 1. Complete Authentication Flow

```
1. Register User → Sets userId
2. Verify Email → (Manual: get token from email/logs)
3. Login → Sets accessToken, refreshToken, userId
4. Get Profile → Verifies authentication
5. Change Password → Updates password
6. Refresh Token → Gets new access token
7. Logout → Revokes refresh token
```

**Password Reset Flow**:
```
1. Forgot Password → Sends reset email
2. Reset Password → (Manual: get token from email/logs)
```

### 2. Project Management Flow

```
1. Create Project → Sets projectId, jobId (202 Accepted)
2. Get User Jobs → Monitor job status
3. Get My Projects → Lists all projects
4. Get Project by ID → Gets specific project details
5. Update Project → Modifies project
6. Export Project Report → Downloads Excel report
7. Delete Project → Removes project (CASCADE deletes papers)
```

### 3. Paper Management Flow

```
1. Add Paper to Project → Sets paperId, scoringJobId (202 Accepted)
2. Get User Jobs → Monitor scoring job
3. Get Project Papers → Lists all papers with scores
4. Get Paper by ID → Gets specific paper with analysis
5. Update Paper → Modifies paper
6. Delete Paper → Removes paper
```

**Bulk Upload Flow**:
```
1. Download CSV Template → Get template file
2. Fill template with papers
3. Bulk Upload Papers (CSV) → Upload file (202 Accepted)
4. Get User Jobs → Monitor bulk upload jobs
```

### 4. LLM Pipeline Testing

```
1. Stage 1 - Intent Decomposition → Analyze user idea
2. Stage 2 - Query Generation → Generate search queries
3. Paper Scoring → Score candidate paper
```

### 5. Credits & Usage Tracking

```
1. Get My Credits Balance → Check current balance
2. Get My LLM Usage (USD) → View costs in USD
3. Get My LLM Usage (Credits) → View costs in Credits
4. Get Project LLM Usage (USD) → Project-specific costs
5. Get Wallet Transaction History → View all transactions
```

### 6. Admin - Model Pricing Management

```
1. List Model Pricing → View all pricing
2. Create Model Pricing → Add new model pricing
3. Update Model Pricing → Modify pricing
4. Delete Model Pricing → Remove pricing
```

### 7. Admin - System Configuration

```
1. Get System Configuration → View current config
2. Update Credits Multiplier → Change USD to Credits rate
3. Get Multiplier History → View rate changes
4. Update Default Credits → Change signup credits
5. Get Default Credits History → View credit changes
```

### 8. Admin - Credits Management

```
1. Get User Credits Balance → Check user balance
2. Recharge User Credits → Add credits to user
3. Deduct User Credits → Remove credits from user
4. Get User Wallet Transaction History → User's transactions
5. Get Global Wallet Transaction History → All transactions
```

---

## Test Scripts (Automatic)

The collection includes **automatic test scripts** that save IDs and tokens:

### ✅ On Register:
```javascript
pm.environment.set('userId', response.data.user.id);
```

### ✅ On Login:
```javascript
pm.environment.set('accessToken', response.data.tokens.accessToken);
pm.environment.set('refreshToken', response.data.tokens.refreshToken);
pm.environment.set('userId', response.data.user.id);
```

### ✅ On Refresh Token:
```javascript
pm.environment.set('accessToken', response.data.tokens.accessToken);
pm.environment.set('refreshToken', response.data.tokens.refreshToken);
```

### ✅ On Create Project:
```javascript
pm.environment.set('projectId', response.data.project.id);
pm.environment.set('jobId', response.data.jobId);
```

### ✅ On Add Paper:
```javascript
pm.environment.set('paperId', response.data.paper.id);
pm.environment.set('scoringJobId', response.data.jobId);
```

### ✅ On Create Model Pricing:
```javascript
pm.environment.set('pricingId', response.data.pricing.id);
```

**You don't need to copy/paste IDs manually!**

---

## Running the Collection

### Option 1: Manual Testing

1. Select a request
2. Click **"Send"**
3. View response in the bottom panel
4. Check **"Tests"** tab for auto-saved variables

### Option 2: Collection Runner (Automated)

1. Click **"..."** next to collection name
2. Select **"Run collection"**
3. Select requests to run (or select all 52)
4. Click **"Run Literature Review System API - Complete"**
5. View results with pass/fail status

**Recommended Order**:
1. Authentication folder first (to get tokens)
2. User Projects folder (to create test data)
3. Candidate Papers folder (to test paper management)
4. Other folders as needed

### Option 3: Newman (CLI)

```bash
# Install Newman
npm install -g newman

# Run entire collection (all 52 endpoints)
newman run documentation/postman-collection-complete.json \
  -e documentation/postman-environment-complete.json

# Run with HTML report
newman run documentation/postman-collection-complete.json \
  -e documentation/postman-environment-complete.json \
  -r html --reporter-html-export report.html

# Run specific folder
newman run documentation/postman-collection-complete.json \
  -e documentation/postman-environment-complete.json \
  --folder "Authentication"
```

---

## Switching Environments

### Create Production Environment

1. Click **"Environments"** (left sidebar)
2. Click **"+"** to create new environment
3. Name it **"Literature Review - Production"**
4. Add variables:
   ```
   baseUrl = https://api.yourproduction.com
   userEmail = your-prod-email@example.com
   userPassword = YourProdPassword123!
   ```
5. Click **"Save"**

### Switch Between Environments

- **Development**: `http://localhost:5000`
- **Staging**: `https://staging-api.yourapp.com`
- **Production**: `https://api.yourapp.com`

Just select from the dropdown (top right)!

---

## Tips & Tricks

### 1. View Environment Variables

- Click **"eye icon"** (👁️) next to environment dropdown
- See all current values (including auto-saved IDs)
- Edit values directly if needed

### 2. Pre-request Scripts

Add to any request to run code before sending:

```javascript
// Example: Add timestamp to request
pm.environment.set('timestamp', new Date().toISOString());

// Example: Generate random email for testing
pm.environment.set('randomEmail', `test${Date.now()}@example.com`);
```

### 3. Tests Tab

View/edit test scripts for each request:

```javascript
// Example: Validate response structure
pm.test("Status is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Response has success field", function() {
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
});

pm.test("Response has data", function() {
    const response = pm.response.json();
    pm.expect(response.data).to.exist;
});
```

### 4. Console Debugging

- Open **Postman Console** (bottom left, "Console" button)
- See all requests/responses
- Debug test scripts with `console.log()`
- View auto-saved environment variables

### 5. Save Responses as Examples

1. Send a request
2. Click **"Save Response"** → **"Save as example"**
3. Name it (e.g., "Success - 200 OK", "Error - 401 Unauthorized")
4. Use for documentation and team sharing

### 6. Organize with Folders

The collection is already organized into 11 folders:
- Right-click folder → "Run folder" to test all endpoints in that category
- Collapse/expand folders to focus on specific areas

### 7. Use Variables in Request Body

```json
{
  "email": "{{userEmail}}",
  "password": "{{userPassword}}",
  "projectId": "{{projectId}}"
}
```

Variables are automatically replaced with environment values!

---

## Common Issues

### ❌ "Could not get response"

**Solution**: Check if backend is running
```bash
cd literature-review-backend
npm run dev
```

Verify server is running on `http://localhost:5000`

### ❌ "401 Unauthorized"

**Solution**: Login again to refresh token
1. Run **"Login"** request
2. Token will auto-update in environment
3. Retry failed request

**Or**: Check if access token expired (15 min expiry)
1. Run **"Refresh Token"** request
2. Get new access token
3. Retry

### ❌ "404 Not Found"

**Solution**: Check if IDs are set
1. Open environment (👁️ icon)
2. Verify `projectId`, `paperId`, etc. have values
3. Run creation requests if empty

**Common causes**:
- Project deleted but `projectId` still in environment
- Paper deleted but `paperId` still in environment
- Wrong `userId` in environment

### ❌ "Environment variable not defined"

**Solution**: Select environment
1. Click environment dropdown (top right)
2. Select **"Literature Review - Development (Complete)"**
3. Verify it's selected (checkmark visible)

### ❌ "400 Bad Request - Validation Error"

**Solution**: Check request body
1. View **"Body"** tab
2. Ensure all required fields are present
3. Check data types (string, number, boolean)
4. Verify email format, password strength, etc.

### ❌ "403 Forbidden"

**Solution**: Check user permissions
- Some endpoints require admin privileges
- Verify user account has correct role
- Check if email is verified (`isVerified = true`)

### ❌ "409 Conflict"

**Solution**: Resource already exists
- Email already registered → Use different email
- Project name duplicate → Use different name
- Model pricing already exists → Update instead of create

### ❌ "500 Internal Server Error"

**Solution**: Check server logs
```bash
# View server logs
cd literature-review-backend
# Check terminal where npm run dev is running
```

Common causes:
- Database connection issue
- Redis not running (for background jobs)
- Missing environment variables

---

## Advanced: Mock Server

### Create Mock Server from Collection

1. Click **"..."** next to collection
2. Select **"Mock collection"**
3. Name it **"Literature Review Mock"**
4. Click **"Create Mock Server"**
5. Get mock URL: `https://xxxxx.mock.pstmn.io`

### Use Mock Server

```bash
# Test against mock
curl https://xxxxx.mock.pstmn.io/v1/health

# In Postman, change baseUrl to mock URL
```

**Use cases**:
- Frontend development before backend is ready
- Testing without affecting real data
- Demo purposes
- API documentation

---

## Exporting Collection

### Share with Team

1. Click **"..."** next to collection
2. Select **"Export"**
3. Choose **"Collection v2.1"** (recommended)
4. Click **"Export"**
5. Share JSON file with team

### Generate Code Snippets

1. Select any request
2. Click **"Code"** (</> icon, right side)
3. Choose language:
   - cURL
   - JavaScript (Fetch, Axios)
   - Python (Requests)
   - Node.js (Native, Axios)
   - PHP, Ruby, Go, etc.
4. Copy code for your application

**Example - cURL**:
```bash
curl --location 'http://localhost:5000/v1/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "test@example.com",
  "password": "Test123!"
}'
```

**Example - JavaScript (Fetch)**:
```javascript
fetch('http://localhost:5000/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'Test123!'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

---

## Testing Best Practices

### 1. Test in Order

For new users, run requests in this order:
1. **Register User** → Create account
2. **Login** → Get tokens
3. **Get Profile** → Verify auth works
4. **Create Project** → Create test data
5. **Add Paper** → Test paper management
6. **Get User Jobs** → Monitor background jobs
7. Other endpoints as needed

### 2. Use Descriptive Names

When saving examples or creating new requests:
- ✅ "Login - Success (200)"
- ✅ "Create Project - Insufficient Credits (402)"
- ❌ "Test 1"
- ❌ "Request"

### 3. Clean Up Test Data

After testing:
- Delete test projects
- Delete test papers
- Logout to revoke tokens
- Or use a dedicated test database

### 4. Monitor Background Jobs

For async operations (project creation, paper scoring):
1. Note the `jobId` from response
2. Poll **"Get User Jobs"** endpoint
3. Check `status` field:
   - `PENDING` - Waiting to start
   - `PROCESSING` - Currently running
   - `COMPLETED` - Finished successfully
   - `FAILED` - Error occurred
   - `FAILED_NO_CREDITS` - Insufficient credits

### 5. Test Error Cases

Don't just test happy paths:
- Invalid credentials
- Missing required fields
- Insufficient credits
- Unauthorized access
- Non-existent resources

---

## Endpoint Categories Explained

### Authentication (10 endpoints)
User registration, login, email verification, password management

### User Projects (7 endpoints)
CRUD operations for research projects + export functionality

### Candidate Papers (7 endpoints)
Paper management including bulk CSV upload

### Background Jobs (3 endpoints)
Monitor and retry async LLM processing jobs

### LLM Pipeline (3 endpoints)
Direct LLM processing stages (for testing/debugging)

### LLM Usage Tracking (6 endpoints)
View usage costs in USD and Credits, per user or project

### Credits (1 endpoint)
Check current AI Credits balance

### Admin - Model Pricing (4 endpoints)
Manage LLM model pricing (admin only)

### Admin - System Config (5 endpoints)
Configure system settings like Credits multiplier (admin only)

### Admin - Credits Management (5 endpoints)
Manually adjust user credits (admin only)

### Health Check (1 endpoint)
Verify API is running

---

## Next Steps

1. ✅ **Import collection and environment** (both `-complete` files)
2. ✅ **Start backend server** (`npm run dev`)
3. ✅ **Start Redis** (required for background jobs)
4. ✅ **Run "Register User"** request
5. ✅ **Run "Login"** request (tokens auto-saved)
6. ✅ **Test project creation** (async job)
7. ✅ **Monitor job status** with "Get User Jobs"
8. ✅ **Test paper management** (async scoring)
9. ✅ **Explore admin endpoints** (if admin user)
10. ✅ **Use Collection Runner** for automated testing

---

## Resources

- **Postman Learning Center**: https://learning.postman.com/
- **Newman Documentation**: https://www.npmjs.com/package/newman
- **API Documentation**: `documentation/03_API.md` (52 endpoints documented)
- **OpenAPI Spec**: `documentation/openapi-complete.yaml` (complete spec)
- **Database Schema**: `documentation/04_DATABASE.md`
- **Architecture**: `documentation/02_ARCHITECTURE.md`

---

## Quick Reference

**Collection**: `postman-collection-complete.json` (52 endpoints)  
**Environment**: `postman-environment-complete.json` (13 variables)  
**Base URL**: `http://localhost:5000/v1`  
**Auth**: JWT Bearer token (auto-managed)  
**Total Folders**: 11  
**Total Requests**: 52

---

**Your complete Postman collection with all 52 endpoints is ready to use! Start testing your API now.** 🚀
